import type { FastifyReply, FastifyRequest, RouteHandlerMethod } from "fastify";
import { env } from "../../config/env.js";
import { Errors } from "../../lib/errors.js";
import { resolveActor } from "../../auth/session.js";
import { runWithContext, type Actor, type RequestContext } from "../../tenant/context.js";

declare module "fastify" {
  interface FastifyRequest {
    actor?: Actor;
    reqContext?: RequestContext;
  }
}

function extractToken(req: FastifyRequest): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  const cookie = (req.cookies as Record<string, string> | undefined)?.[env.SESSION_COOKIE_NAME];
  return cookie ?? null;
}

/** onRequest hook: authenticate if a token is present (does not enforce). */
export async function authenticate(req: FastifyRequest): Promise<void> {
  const token = extractToken(req);
  if (!token) return;
  const actor = await resolveActor(token);
  req.actor = actor;
  req.reqContext = { actor, requestId: String(req.id), ip: req.ip };
}

/**
 * Wrap an authenticated route handler so it runs inside the tenant/actor
 * AsyncLocalStorage context. Rejects if no valid session is attached.
 * ALS propagates across awaits, so services can call getActor()/requireOrgScope().
 */
export function authed(fn: (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>): RouteHandlerMethod {
  return function (this: unknown, req: FastifyRequest, reply: FastifyReply) {
    if (!req.actor || !req.reqContext) throw Errors.unauthorized();
    return runWithContext(req.reqContext, () => fn(req, reply));
  };
}
