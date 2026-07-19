import { getActor } from "../../tenant/context.js";
import { assertPermission } from "../../rbac/policy.js";
import { assertSubscriptionActive, assertFeature } from "../../entitlement/service.js";
import { Errors } from "../../lib/errors.js";
import { writeAudit } from "../audit/service.js";
import { TOOL_REGISTRY, FORBIDDEN_ACTIONS } from "./registry.js";
import type { JarvisCommand } from "./commandSchema.js";

export interface CommandResult {
  commandId: string;
  status: "executed" | "requires_confirmation" | "denied";
  action: string;
  result?: unknown;
  reason?: string;
}

/**
 * Execute a Jarvis command AFTER full backend re-validation (spec §19). The
 * request is already authenticated as the acting doctor (the app relays through
 * the doctor's own session), so Jarvis holds no standing privileges. Every step
 * that denies is audited; a command's mere existence never implies authorization.
 */
export async function executeCommand(cmd: JarvisCommand): Promise<CommandResult> {
  const actor = getActor();
  const deny = async (reason: string): Promise<never> => {
    await writeAudit({
      action: "jarvis.command",
      decision: "deny",
      resourceType: "command",
      resourceId: cmd.commandId,
      reason,
      metadata: { action: cmd.action },
    });
    throw Errors.forbidden(`Command denied: ${reason}`);
  };

  // 2. Denylist — actions Jarvis may never perform.
  if (FORBIDDEN_ACTIONS.has(cmd.action)) await deny("forbidden action");

  // 3. Identity + tenant: declared context MUST match the authenticated session.
  if (cmd.organizationId !== actor.organizationId) await deny("tenant mismatch");
  if (cmd.actor.userId !== actor.userId) await deny("actor mismatch");
  if (cmd.actor.sessionId !== actor.sessionId) await deny("session mismatch");
  if (cmd.actor.deviceId && actor.deviceId && cmd.actor.deviceId !== actor.deviceId) {
    await deny("device mismatch");
  }

  // 6/7. Role + permission (allowlisted tool).
  const tool = TOOL_REGISTRY[cmd.action];
  if (!tool) await deny("unknown action");
  assertPermission(tool!.requiredPermission);

  // 8/9. Subscription active + feature entitlement.
  await assertSubscriptionActive(actor.organizationId!);
  if (tool!.requiredFeature) await assertFeature(actor.organizationId!, tool!.requiredFeature);

  // 11. Safety: mutating commands require explicit clinician confirmation.
  if (tool!.mutates && !cmd.requiresConfirmation) {
    await writeAudit({
      action: "jarvis.command",
      decision: "info",
      resourceType: "command",
      resourceId: cmd.commandId,
      reason: "confirmation_required",
      metadata: { action: cmd.action },
    });
    return { commandId: cmd.commandId, status: "requires_confirmation", action: cmd.action };
  }

  // Execute the allowlisted, validated tool (10. resource scope enforced inside).
  const result = await tool!.handler(cmd.parameters);
  await writeAudit({
    action: "jarvis.command",
    decision: "allow",
    resourceType: "command",
    resourceId: cmd.commandId,
    metadata: { action: cmd.action },
  });
  return { commandId: cmd.commandId, status: "executed", action: cmd.action, result };
}
