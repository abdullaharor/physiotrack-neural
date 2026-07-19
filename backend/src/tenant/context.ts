import { AsyncLocalStorage } from "node:async_hooks";
import { Errors } from "../lib/errors.js";
import type { UserRole } from "@prisma/client";

/**
 * The authenticated actor + tenant for the current request. Established by the
 * auth + tenant middleware from the SESSION — never from the client body/query.
 * All tenant-scoped data access derives organizationId from here.
 */
export interface Actor {
  userId: string;
  role: UserRole;
  /** null only for platform_owner (not bound to a clinic). */
  organizationId: string | null;
  sessionId: string;
  deviceId: string | null;
  permissions: string[];
}

export interface RequestContext {
  actor: Actor;
  requestId: string;
  ip?: string;
}

const als = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return als.run(ctx, fn);
}

export function getContext(): RequestContext {
  const ctx = als.getStore();
  if (!ctx) throw Errors.internal("Request context is not available");
  return ctx;
}

export function getActor(): Actor {
  return getContext().actor;
}

/**
 * The organizationId that every tenant-scoped query MUST filter by.
 * Throws for platform owners (who must use platform-scoped services instead of
 * accidentally reading tenant data with a null scope).
 */
export function requireOrgScope(): string {
  const { organizationId } = getActor();
  if (!organizationId) throw Errors.forbidden("This operation requires a clinic scope");
  return organizationId;
}

/**
 * Guard: a fetched record's organizationId must equal the caller's scope.
 * On mismatch we throw a *not-found* (never reveal cross-tenant existence).
 */
export function assertSameTenant(recordOrgId: string | null | undefined): void {
  const scope = requireOrgScope();
  if (recordOrgId !== scope) throw Errors.tenantScopeViolation();
}

/** Merge the caller's org scope into a Prisma `where` (defense against un-scoped reads). */
export function tenantWhere<T extends Record<string, unknown>>(where: T): T & { organizationId: string } {
  return { ...where, organizationId: requireOrgScope() };
}
