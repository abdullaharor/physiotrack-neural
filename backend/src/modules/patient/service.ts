import { prisma } from "../../db/prisma.js";
import { requireOrgScope, getActor, assertSameTenant } from "../../tenant/context.js";
import { Errors } from "../../lib/errors.js";
import { writeAudit } from "../audit/service.js";

export interface CreatePatientInput {
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  diagnosis?: string;
  dxKey?: string;
}

export async function createPatient(input: CreatePatientInput) {
  const organizationId = requireOrgScope();
  const actor = getActor();
  const patient = await prisma.patient.create({
    data: {
      organizationId,
      fullName: input.fullName,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      diagnosis: input.diagnosis,
      dxKey: input.dxKey,
      createdById: actor.userId,
    },
  });
  await writeAudit({ action: "patient.create", decision: "allow", resourceType: "patient", resourceId: patient.id });
  return patient;
}

export function listPatients(query?: { search?: string }) {
  const organizationId = requireOrgScope();
  return prisma.patient.findMany({
    where: {
      organizationId,
      ...(query?.search
        ? { fullName: { contains: query.search, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

/**
 * Fetch one patient, enforcing tenant scope. A patient from another clinic (or a
 * non-existent id) returns the SAME not-found — cross-tenant existence is never
 * revealed. The denied attempt is audited.
 */
export async function getPatient(patientId: string) {
  const organizationId = requireOrgScope();
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient || patient.organizationId !== organizationId) {
    if (patient) {
      // A real record exists but belongs to another tenant → audit the attempt.
      await writeAudit({
        action: "patient.cross_tenant_attempt",
        decision: "deny",
        resourceType: "patient",
        resourceId: patientId,
      });
    }
    throw Errors.notFound();
  }
  return patient;
}

export async function updatePatient(patientId: string, input: Partial<CreatePatientInput>) {
  const existing = await getPatient(patientId); // enforces scope
  assertSameTenant(existing.organizationId);
  const patient = await prisma.patient.update({
    where: { id: patientId },
    data: {
      fullName: input.fullName,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      diagnosis: input.diagnosis,
      dxKey: input.dxKey,
    },
  });
  await writeAudit({ action: "patient.update", decision: "allow", resourceType: "patient", resourceId: patientId });
  return patient;
}
