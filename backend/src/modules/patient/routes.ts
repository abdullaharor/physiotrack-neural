import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authed } from "../../http/plugins/context.js";
import { assertPermission } from "../../rbac/policy.js";
import { PERMISSIONS } from "../../rbac/permissions.js";
import { assertSubscriptionActive } from "../../entitlement/service.js";
import { requireOrgScope } from "../../tenant/context.js";
import { createPatient, listPatients, getPatient, updatePatient } from "./service.js";

const createSchema = z.object({
  fullName: z.string().min(2),
  gender: z.enum(["male", "female"]).optional(),
  dateOfBirth: z.string().datetime().optional(),
  diagnosis: z.string().optional(),
  dxKey: z.string().optional(),
});

export async function registerPatientRoutes(app: FastifyInstance): Promise<void> {
  app.post("/patients", authed(async (req, reply) => {
    assertPermission(PERMISSIONS.patientsCreate);
    await assertSubscriptionActive(requireOrgScope());
    const body = createSchema.parse(req.body);
    const patient = await createPatient(body);
    reply.status(201);
    return patient;
  }));

  app.get("/patients", authed(async (req) => {
    assertPermission(PERMISSIONS.patientsRead);
    const q = z.object({ search: z.string().optional() }).parse(req.query);
    return listPatients(q);
  }));

  app.get("/patients/:id", authed(async (req) => {
    assertPermission(PERMISSIONS.patientsRead);
    const { id } = z.object({ id: z.string() }).parse(req.params);
    return getPatient(id);
  }));

  app.patch("/patients/:id", authed(async (req) => {
    assertPermission(PERMISSIONS.patientsUpdate);
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = createSchema.partial().parse(req.body);
    return updatePatient(id, body);
  }));
}
