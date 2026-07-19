import type { FastifyInstance } from "fastify";
import { authed } from "../../http/plugins/context.js";
import { assertPermission } from "../../rbac/policy.js";
import { PERMISSIONS } from "../../rbac/permissions.js";
import { jarvisCommandSchema } from "./commandSchema.js";
import { executeCommand } from "./service.js";
import { TOOL_REGISTRY } from "./registry.js";

export async function registerConnectorRoutes(app: FastifyInstance): Promise<void> {
  // Capability discovery — which actions this host exposes.
  app.get("/connector/capabilities", authed(async () => {
    assertPermission(PERMISSIONS.jarvisUse);
    return {
      version: "1.0",
      actions: Object.values(TOOL_REGISTRY).map((t) => ({
        action: t.action,
        requiredPermission: t.requiredPermission,
        requiredFeature: t.requiredFeature ?? null,
        mutates: t.mutates,
      })),
    };
  }));

  // Command receiver — relayed through the acting doctor's authenticated session.
  app.post("/connector/commands", authed(async (req, reply) => {
    assertPermission(PERMISSIONS.jarvisUse);
    const cmd = jarvisCommandSchema.parse(req.body);
    const result = await executeCommand(cmd);
    if (result.status === "denied") reply.status(403);
    return result;
  }));
}
