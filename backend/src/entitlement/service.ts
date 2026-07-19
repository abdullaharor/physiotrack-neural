import { prisma } from "../db/prisma.js";
import { Errors } from "../lib/errors.js";
import { writeAudit } from "../modules/audit/service.js";
import type { PlanFeatures, PlanLimits, FeatureKey } from "./plans.js";
import type { Subscription } from "@prisma/client";

/**
 * Entitlement Service — the single backend authority for "is this feature
 * allowed?" and "is there a free seat?". Reads the authoritative limits/features
 * from the organization's Subscription row (config, not hardcoded), enforces
 * them, and audits every allow/deny decision.
 */

// Doctor seats count these states (configurable policy).
const SEAT_COUNTED_STATES = ["pending_activation", "active", "suspended"] as const;

export interface Entitlements {
  subscription: Subscription;
  limits: PlanLimits;
  features: PlanFeatures;
  active: boolean;
}

export async function getEntitlements(organizationId: string): Promise<Entitlements> {
  const subscription = await prisma.subscription.findUnique({ where: { organizationId } });
  if (!subscription) throw Errors.subscriptionInactive("missing");
  const active = subscription.status === "active" || subscription.status === "grace";
  return {
    subscription,
    limits: subscription.limits as unknown as PlanLimits,
    features: subscription.features as unknown as PlanFeatures,
    active,
  };
}

/** Reject if the subscription is not usable (suspended/cancelled). */
export async function assertSubscriptionActive(organizationId: string): Promise<Entitlements> {
  const ent = await getEntitlements(organizationId);
  if (!ent.active) {
    await writeAudit({
      action: "entitlement.subscription_check",
      decision: "deny",
      reason: ent.subscription.status,
      organizationId,
    });
    throw Errors.subscriptionInactive(ent.subscription.status);
  }
  return ent;
}

export async function isFeatureAllowed(organizationId: string, feature: FeatureKey): Promise<boolean> {
  const ent = await getEntitlements(organizationId);
  return ent.active && ent.features[feature] === true;
}

/** Throwing feature gate. Backend enforcement — never rely on UI hiding. */
export async function assertFeature(organizationId: string, feature: FeatureKey): Promise<void> {
  const allowed = await isFeatureAllowed(organizationId, feature);
  await writeAudit({
    action: "entitlement.feature_check",
    decision: allowed ? "allow" : "deny",
    resourceType: "feature",
    resourceId: feature,
    organizationId,
  });
  if (!allowed) throw Errors.entitlementDenied(feature);
}

export async function countDoctorSeats(organizationId: string): Promise<number> {
  return prisma.user.count({
    where: { organizationId, role: "doctor", status: { in: [...SEAT_COUNTED_STATES] } },
  });
}

export interface SeatUsage {
  resource: "doctor_seats";
  used: number;
  limit: number;
  remaining: number;
}

export async function getDoctorSeatUsage(organizationId: string): Promise<SeatUsage> {
  const ent = await getEntitlements(organizationId);
  const used = await countDoctorSeats(organizationId);
  const limit = ent.limits.maxDoctors;
  return { resource: "doctor_seats", used, limit, remaining: Math.max(0, limit - used) };
}

/**
 * Reserve-check a doctor seat. Throws seat_limit_reached (with upgrade hint) if
 * at the limit. Enforced in the backend so the UI, API, and Jarvis cannot bypass.
 */
export async function assertDoctorSeatAvailable(organizationId: string): Promise<SeatUsage> {
  await assertSubscriptionActive(organizationId);
  const usage = await getDoctorSeatUsage(organizationId);
  const ok = usage.used < usage.limit;
  await writeAudit({
    action: "entitlement.seat_check",
    decision: ok ? "allow" : "deny",
    resourceType: "doctor_seats",
    reason: ok ? undefined : `used ${usage.used} of ${usage.limit}`,
    metadata: { used: usage.used, limit: usage.limit },
    organizationId,
  });
  if (!ok) throw Errors.seatLimitReached("doctor_seats", usage.limit);
  return usage;
}
