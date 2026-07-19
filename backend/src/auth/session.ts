import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";
import { newSecretToken, hashToken, newId } from "../lib/ids.js";
import { Errors } from "../lib/errors.js";
import { writeAudit } from "../modules/audit/service.js";
import type { Actor } from "../tenant/context.js";
import type { User } from "@prisma/client";

export interface IssuedSession {
  sessionId: string;
  token: string; // opaque; returned once, stored hashed
  refreshToken: string;
  expiresAt: Date;
}

function ttlDate(minutes: number): Date {
  return new Date(Date.now() + minutes * 60_000);
}
function daysDate(days: number): Date {
  return new Date(Date.now() + days * 86_400_000);
}

export async function createSession(
  user: User,
  opts: { deviceId?: string | null; ip?: string; userAgent?: string },
): Promise<IssuedSession> {
  const token = newSecretToken();
  const refreshToken = newSecretToken();
  const expiresAt = ttlDate(env.SESSION_TTL_MINUTES);
  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      organizationId: user.organizationId,
      deviceId: opts.deviceId ?? null,
      tokenHash: hashToken(token),
      refreshTokenHash: hashToken(refreshToken),
      refreshFamilyId: newId(),
      status: "active",
      ip: opts.ip,
      userAgent: opts.userAgent,
      expiresAt,
      refreshExpiresAt: daysDate(env.REFRESH_TTL_DAYS),
    },
  });
  return { sessionId: session.id, token, refreshToken, expiresAt };
}

/** Resolve an actor from a session token, or throw unauthorized. */
export async function resolveActor(token: string): Promise<Actor> {
  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.status !== "active") throw Errors.unauthorized();
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.authSession.update({ where: { id: session.id }, data: { status: "expired" } });
    throw Errors.unauthorized("Session expired");
  }
  const user = session.user;
  if (user.status !== "active") throw Errors.unauthorized("Account not active");
  await prisma.authSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
  return {
    userId: user.id,
    role: user.role,
    organizationId: user.organizationId,
    sessionId: session.id,
    deviceId: session.deviceId,
    permissions: user.permissions,
  };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.authSession.update({
    where: { id: sessionId },
    data: { status: "revoked", revokedAt: new Date() },
  });
}

/**
 * Rotate a refresh token with REUSE DETECTION: if a refresh token that has
 * already been rotated is presented again, the whole family is revoked and all
 * its sessions terminated (token theft response).
 */
export async function rotateRefresh(refreshToken: string): Promise<IssuedSession> {
  const current = await prisma.authSession.findUnique({
    where: { refreshTokenHash: hashToken(refreshToken) },
    include: { user: true },
  });
  if (!current) {
    // Unknown/again-used refresh token → could be reuse of a rotated token.
    throw Errors.unauthorized("Invalid refresh token");
  }
  if (current.status !== "active") {
    // Reuse of a token from a revoked/expired session → kill the family.
    if (current.refreshFamilyId) {
      await prisma.authSession.updateMany({
        where: { refreshFamilyId: current.refreshFamilyId, status: "active" },
        data: { status: "revoked", revokedAt: new Date() },
      });
    }
    await writeAudit({
      action: "auth.refresh_reuse_detected",
      decision: "deny",
      resourceType: "session",
      resourceId: current.id,
      organizationId: current.organizationId,
    });
    throw Errors.unauthorized("Refresh token reuse detected");
  }
  // Rotate: revoke current, issue a new session in the same family.
  const token = newSecretToken();
  const newRefresh = newSecretToken();
  const expiresAt = ttlDate(env.SESSION_TTL_MINUTES);
  await prisma.authSession.update({
    where: { id: current.id },
    data: { status: "revoked", revokedAt: new Date() },
  });
  const next = await prisma.authSession.create({
    data: {
      userId: current.userId,
      organizationId: current.organizationId,
      deviceId: current.deviceId,
      tokenHash: hashToken(token),
      refreshTokenHash: hashToken(newRefresh),
      refreshFamilyId: current.refreshFamilyId,
      status: "active",
      expiresAt,
    },
  });
  return { sessionId: next.id, token, refreshToken: newRefresh, expiresAt };
}
