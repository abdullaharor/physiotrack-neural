import { prisma } from "../../db/prisma.js";
import { getContext } from "../../tenant/context.js";
import type { AuditDecision } from "@prisma/client";

export interface AuditInput {
  action: string;
  decision?: AuditDecision;
  resourceType?: string;
  resourceId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  /** Override org (e.g. platform-owner acting on a specific clinic). */
  organizationId?: string | null;
}

/**
 * Append an audit entry. Every sensitive action and every allow/deny
 * authorization decision must be recorded. Never store PHI in audit metadata.
 */
export async function writeAudit(input: AuditInput): Promise<void> {
  let actor: ReturnType<typeof getContext>["actor"] | null = null;
  let ip: string | undefined;
  try {
    const ctx = getContext();
    actor = ctx.actor;
    ip = ctx.ip;
  } catch {
    // audit may be written outside a request context (system tasks)
  }
  await prisma.auditLog.create({
    data: {
      organizationId: input.organizationId ?? actor?.organizationId ?? null,
      actorUserId: actor?.userId ?? null,
      actorRole: actor?.role ?? null,
      action: input.action,
      decision: input.decision ?? "info",
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      reason: input.reason,
      ip,
      metadata: (input.metadata ?? undefined) as object | undefined,
    },
  });
}
