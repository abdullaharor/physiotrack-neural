import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authed } from "../../http/plugins/context.js";
import { assertPermission, assertClinicOwner } from "../../rbac/policy.js";
import { PERMISSIONS } from "../../rbac/permissions.js";
import { createDoctor, listDoctors, suspendDoctor } from "./doctorService.js";
import { getDoctorSeatUsage } from "../../entitlement/service.js";
import { requireOrgScope } from "../../tenant/context.js";

const createSchema = z.object({
  displayName: z.string().min(2),
  licenseNumber: z.string().optional(),
});

export async function registerDoctorRoutes(app: FastifyInstance): Promise<void> {
  app.post("/clinic/doctors", authed(async (req, reply) => {
    assertPermission(PERMISSIONS.doctorsCreate);
    const body = createSchema.parse(req.body);
    const result = await createDoctor(body);
    reply.status(201);
    return result;
  }));

  app.get("/clinic/doctors", authed(async () => {
    assertClinicOwner();
    return listDoctors();
  }));

  app.get("/clinic/seats", authed(async () => {
    assertPermission(PERMISSIONS.subscriptionView);
    return getDoctorSeatUsage(requireOrgScope());
  }));

  app.post("/clinic/doctors/:id/suspend", authed(async (req) => {
    assertPermission(PERMISSIONS.doctorsSuspend);
    const { id } = z.object({ id: z.string() }).parse(req.params);
    await suspendDoctor(id);
    return { ok: true };
  }));
}
