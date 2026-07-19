import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { env } from "../../config/env.js";
import { Errors } from "../../lib/errors.js";
import { hashPassword, verifyPassword, isStrongPassword } from "../../auth/password.js";
import { createSession, rotateRefresh, revokeSession } from "../../auth/session.js";
import { consumeActivationToken } from "../../auth/activation.js";
import { authed } from "../../http/plugins/context.js";
import { writeAudit } from "../audit/service.js";

const loginSchema = z.object({
  clinicCode: z.string().optional(),
  userId: z.string().min(1),
  password: z.string().min(1),
});

const activateSchema = z.object({
  activationToken: z.string().min(1),
  password: z.string().min(1),
});

function setSessionCookie(reply: import("fastify").FastifyReply, token: string, expiresAt: Date) {
  reply.setCookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  // Closed system: NO signup route exists by design.

  app.post("/auth/login", async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      include: { password: true, organization: true },
    });
    // Uniform failure — never reveal which factor was wrong or if user exists.
    const fail = () => Errors.unauthorized("Invalid credentials");
    if (!user || !user.password) throw fail();
    if (body.clinicCode && user.organization?.slug !== body.clinicCode) throw fail();
    if (user.status === "locked") throw Errors.forbidden("Account locked");
    if (user.status !== "active") throw fail();
    const ok = await verifyPassword(user.password.argon2Hash, body.password);
    if (!ok) {
      await writeAudit({ action: "auth.login", decision: "deny", resourceType: "user", resourceId: user.id, organizationId: user.organizationId });
      throw fail();
    }
    const session = await createSession(user, { ip: req.ip, userAgent: req.headers["user-agent"] });
    setSessionCookie(reply, session.token, session.expiresAt);
    await writeAudit({ action: "auth.login", decision: "allow", resourceType: "user", resourceId: user.id, organizationId: user.organizationId });
    return { token: session.token, refreshToken: session.refreshToken, expiresAt: session.expiresAt, role: user.role };
  });

  // Provisioned users activate here (transitional password path; passkey later).
  app.post("/auth/activate", async (req) => {
    const body = activateSchema.parse(req.body);
    if (!isStrongPassword(body.password)) {
      throw Errors.validation({ password: "min 12 chars incl. upper, lower, digit" });
    }
    const { userId } = await consumeActivationToken(body.activationToken);
    const hash = await hashPassword(body.password);
    await prisma.$transaction([
      prisma.passwordCredential.upsert({
        where: { userId },
        update: { argon2Hash: hash },
        create: { userId, argon2Hash: hash },
      }),
      prisma.user.update({ where: { id: userId }, data: { status: "active", activatedAt: new Date() } }),
    ]);
    await writeAudit({ action: "user.activate", decision: "allow", resourceType: "user", resourceId: userId });
    return { activated: true };
  });

  app.post("/auth/refresh", async (req, reply) => {
    const { refreshToken } = z.object({ refreshToken: z.string().min(1) }).parse(req.body);
    const session = await rotateRefresh(refreshToken);
    setSessionCookie(reply, session.token, session.expiresAt);
    return { token: session.token, refreshToken: session.refreshToken, expiresAt: session.expiresAt };
  });

  app.post("/auth/logout", authed(async (req, reply) => {
    await revokeSession(req.actor!.sessionId);
    reply.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
    return { ok: true };
  }));

  app.get("/auth/me", authed(async (req) => {
    const a = req.actor!;
    return { userId: a.userId, role: a.role, organizationId: a.organizationId, permissions: a.permissions };
  }));
}
