import { prisma } from "../../db/prisma.js";
import { requireOrgScope, getActor } from "../../tenant/context.js";
import { assertDoctorSeatAvailable, getDoctorSeatUsage } from "../../entitlement/service.js";
import { issueActivationToken } from "../../auth/activation.js";
import { writeAudit } from "../audit/service.js";

export interface CreateDoctorInput {
  displayName: string;
  licenseNumber?: string;
}

export interface CreateDoctorResult {
  userId: string;
  activationToken: string;
  seats: { used: number; limit: number; remaining: number };
}

/**
 * Clinic-Owner action: create a doctor within the clinic, gated by the backend
 * seat limit. Seat availability is checked BEFORE creation; if at the limit the
 * creation is refused (no seat consumed), the plan limit is surfaced, and an
 * upgrade request is offered. Enforced server-side — UI/API/Jarvis cannot bypass.
 */
export async function createDoctor(input: CreateDoctorInput): Promise<CreateDoctorResult> {
  const organizationId = requireOrgScope();
  const actor = getActor();

  // Backend seat enforcement (throws seat_limit_reached with upgrade hint).
  await assertDoctorSeatAvailable(organizationId);

  const doctor = await prisma.user.create({
    data: {
      organizationId,
      role: "doctor",
      status: "pending_activation",
      displayName: input.displayName,
      licenseNumber: input.licenseNumber,
      createdById: actor.userId,
    },
  });

  const activation = await issueActivationToken(doctor.id, actor.userId);
  const usage = await getDoctorSeatUsage(organizationId);

  await writeAudit({
    action: "doctor.create",
    decision: "allow",
    resourceType: "user",
    resourceId: doctor.id,
    metadata: { seatsUsed: usage.used, seatLimit: usage.limit },
  });

  return {
    userId: doctor.id,
    activationToken: activation.activationToken,
    seats: { used: usage.used, limit: usage.limit, remaining: usage.remaining },
  };
}

export function listDoctors() {
  const organizationId = requireOrgScope();
  return prisma.user.findMany({
    where: { organizationId, role: "doctor" },
    select: { id: true, displayName: true, status: true, licenseNumber: true, createdAt: true, activatedAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function suspendDoctor(doctorId: string): Promise<void> {
  const organizationId = requireOrgScope();
  // updateMany with org scope guarantees we never touch another tenant's user.
  const res = await prisma.user.updateMany({
    where: { id: doctorId, organizationId, role: "doctor" },
    data: { status: "suspended" },
  });
  await writeAudit({
    action: "doctor.suspend",
    decision: res.count > 0 ? "allow" : "deny",
    resourceType: "user",
    resourceId: doctorId,
  });
}
