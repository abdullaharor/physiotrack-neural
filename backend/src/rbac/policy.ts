import { Errors } from "../lib/errors.js";
import { getActor, type Actor } from "../tenant/context.js";
import { effectivePermissions, type Permission } from "./permissions.js";

/** Non-throwing permission check (deny-by-default). */
export function can(permission: Permission, actor: Actor = getActor()): boolean {
  return effectivePermissions(actor.role, actor.permissions).has(permission);
}

/** Throwing assertion; use at the top of every mutating/reading handler. */
export function assertPermission(permission: Permission, actor: Actor = getActor()): void {
  if (!can(permission, actor)) {
    throw Errors.forbidden(`Missing permission: ${permission}`);
  }
}

/** Convenience for platform-only operations. */
export function assertPlatformOwner(actor: Actor = getActor()): void {
  if (actor.role !== "platform_owner") throw Errors.forbidden("Platform Owner only");
}

/** Convenience for clinic-owner operations within their own clinic. */
export function assertClinicOwner(actor: Actor = getActor()): void {
  if (actor.role !== "clinic_owner") throw Errors.forbidden("Clinic Owner only");
}
