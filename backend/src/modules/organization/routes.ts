import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authed } from "../../http/plugins/context.js";
import { assertPlatformOwner, assertPermission } from "../../rbac/policy.js";
import { PERMISSIONS } from "../../rbac/permissions.js";
import { provisionClinic, listOrganizations, suspendOrganization } from "./service.js";

const provisionSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[A-Z0-9][A-Z0-9-]{2,40}$/, "clinic code: A-Z, 0-9, hyphens"),
  planCode: z.enum(["clinic-starter", "clinic-professional", "enterprise-custom"]),
  ownerDisplayName: z.string().min(2),
  limitsOverride: z.record(z.unknown()).optional(),
  featuresOverride: z.record(z.unknown()).optional(),
});

export async function registerOrganizationRoutes(app: FastifyInstance): Promise<void> {
  app.post("/platform/organizations", authed(async (req, reply) => {
    assertPlatformOwner();
    assertPermission(PERMISSIONS.organizationsCreate);
    const body = provisionSchema.parse(req.body);
    const result = await provisionClinic(body, req.actor!.userId);
    reply.status(201);
    return result;
  }));

  app.get("/platform/organizations", authed(async () => {
    assertPlatformOwner();
    assertPermission(PERMISSIONS.organizationsManage);
    return listOrganizations();
  }));

  app.post("/platform/organizations/:id/suspend", authed(async (req) => {
    assertPlatformOwner();
    assertPermission(PERMISSIONS.organizationsSuspend);
    const { id } = z.object({ id: z.string() }).parse(req.params);
    await suspendOrganization(id);
    return { ok: true };
  }));
}
