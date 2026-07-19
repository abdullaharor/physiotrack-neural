import { z } from "zod";
import { PERMISSIONS, type Permission } from "../../rbac/permissions.js";
import type { FeatureKey } from "../../entitlement/plans.js";
import { listPatients, getPatient } from "../patient/service.js";
import { getDoctorSeatUsage, getEntitlements } from "../../entitlement/service.js";
import { requireOrgScope } from "../../tenant/context.js";
import { Errors } from "../../lib/errors.js";

/**
 * Tool Registry — the ALLOWLIST of actions Jarvis may request. Anything not
 * listed is rejected. Each tool declares the permission and (optional) feature
 * the backend must verify, plus a validated, read-only-by-default handler.
 * Mutating tools set `mutates: true` and require clinician confirmation.
 */
export interface ToolDef {
  action: string;
  requiredPermission: Permission;
  requiredFeature?: FeatureKey;
  mutates: boolean;
  params: z.ZodTypeAny;
  handler: (params: unknown) => Promise<unknown>;
}

function tool<T extends z.ZodTypeAny>(def: {
  action: string;
  requiredPermission: Permission;
  requiredFeature?: FeatureKey;
  mutates?: boolean;
  params: T;
  handler: (params: z.infer<T>) => Promise<unknown>;
}): ToolDef {
  return {
    action: def.action,
    requiredPermission: def.requiredPermission,
    requiredFeature: def.requiredFeature,
    mutates: def.mutates ?? false,
    params: def.params,
    handler: (raw) => def.handler(def.params.parse(raw)),
  };
}

const notImplemented = (action: string) => async () => {
  throw Errors.internal(`Command not implemented yet: ${action}`);
};

export const TOOL_REGISTRY: Record<string, ToolDef> = {
  "patient.search": tool({
    action: "patient.search",
    requiredPermission: PERMISSIONS.patientsRead,
    params: z.object({ query: z.string().optional() }),
    handler: async (p) => listPatients({ search: p.query }),
  }),
  "patient.open": tool({
    action: "patient.open",
    requiredPermission: PERMISSIONS.patientsRead,
    params: z.object({ patientId: z.string().min(1) }),
    handler: async (p) => getPatient(p.patientId),
  }),
  "subscription.getUsage": tool({
    action: "subscription.getUsage",
    requiredPermission: PERMISSIONS.subscriptionView,
    params: z.object({}),
    handler: async () => getDoctorSeatUsage(requireOrgScope()),
  }),
  "subscription.getLimits": tool({
    action: "subscription.getLimits",
    requiredPermission: PERMISSIONS.subscriptionView,
    params: z.object({}),
    handler: async () => (await getEntitlements(requireOrgScope())).limits,
  }),
  // Known-but-unbuilt actions are declared so they are validated + rejected
  // cleanly (NOT silently allowed). Implemented in later phases.
  "dashboard.getSummary": tool({ action: "dashboard.getSummary", requiredPermission: PERMISSIONS.patientsRead, params: z.object({}), handler: notImplemented("dashboard.getSummary") }),
  "schedule.getToday": tool({ action: "schedule.getToday", requiredPermission: PERMISSIONS.appointmentsRead, params: z.object({}), handler: notImplemented("schedule.getToday") }),
  "treatment.getSuggestions": tool({ action: "treatment.getSuggestions", requiredPermission: PERMISSIONS.clinicalSuggestionsReview, params: z.object({ patientId: z.string() }), handler: notImplemented("treatment.getSuggestions") }),
  "anatomy.open": tool({ action: "anatomy.open", requiredPermission: PERMISSIONS.anatomyUse, requiredFeature: "anatomy3D", params: z.object({}), handler: notImplemented("anatomy.open") }),
};

/**
 * Actions Jarvis may NEVER perform (explicit denylist, spec §20). Even if such a
 * command arrives, it is rejected before any handler lookup.
 */
export const FORBIDDEN_ACTIONS = new Set<string>([
  "clinicOwner.create", "platformOwner.create", "role.change", "subscription.change",
  "limits.increase", "deployment.approve", "security.disable", "organization.switch",
]);
