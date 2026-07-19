import { prisma } from "../../db/prisma.js";
import { Errors } from "../../lib/errors.js";
import { planDefaults } from "../../entitlement/plans.js";
import { issueActivationToken } from "../../auth/activation.js";
import { writeAudit } from "../audit/service.js";

export interface ProvisionClinicInput {
  name: string;
  slug: string; // clinic code
  planCode: string;
  ownerDisplayName: string;
  /** Optional per-contract overrides (esp. Enterprise). */
  limitsOverride?: Record<string, unknown>;
  featuresOverride?: Record<string, unknown>;
}

export interface ProvisionClinicResult {
  organizationId: string;
  ownerUserId: string;
  ownerActivationToken: string; // deliver securely, once
}

/**
 * Platform-Owner action: create a clinic (tenant) + its subscription (limits and
 * features seeded from the plan catalog, overridable per contract) + the Clinic
 * Owner account in `pending_activation` with a single-use activation token.
 * No public path creates clinics or owners.
 */
export async function provisionClinic(
  input: ProvisionClinicInput,
  platformOwnerId: string,
): Promise<ProvisionClinicResult> {
  const plan = planDefaults(input.planCode);

  const existing = await prisma.organization.findUnique({ where: { slug: input.slug } });
  if (existing) throw Errors.conflict("Clinic code already in use");

  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: input.name, slug: input.slug, status: "active" },
    });

    await tx.subscription.create({
      data: {
        organizationId: org.id,
        planCode: plan.planCode,
        status: "active",
        currency: plan.currency,
        amount: plan.amount,
        billingCycle: plan.billingCycle,
        limits: { ...plan.limits, ...(input.limitsOverride ?? {}) },
        features: { ...plan.features, ...(input.featuresOverride ?? {}) },
      },
    });

    const owner = await tx.user.create({
      data: {
        organizationId: org.id,
        role: "clinic_owner",
        status: "pending_activation",
        displayName: input.ownerDisplayName,
        createdById: platformOwnerId,
      },
    });

    return { org, owner };
  });

  const activation = await issueActivationToken(result.owner.id, platformOwnerId);

  await writeAudit({
    action: "organization.provision",
    decision: "allow",
    resourceType: "organization",
    resourceId: result.org.id,
    organizationId: result.org.id,
    metadata: { planCode: plan.planCode, ownerUserId: result.owner.id },
  });

  return {
    organizationId: result.org.id,
    ownerUserId: result.owner.id,
    ownerActivationToken: activation.activationToken,
  };
}

export async function suspendOrganization(organizationId: string): Promise<void> {
  await prisma.organization.update({ where: { id: organizationId }, data: { status: "suspended" } });
  await writeAudit({
    action: "organization.suspend",
    decision: "allow",
    resourceType: "organization",
    resourceId: organizationId,
    organizationId,
  });
}

export function listOrganizations() {
  return prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: { subscription: { select: { planCode: true, status: true } } },
  });
}
