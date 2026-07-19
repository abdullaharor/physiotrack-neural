import { describe, it, expect } from "vitest";
import {
  runWithContext,
  requireOrgScope,
  assertSameTenant,
  tenantWhere,
  type RequestContext,
} from "../src/tenant/context.js";

function ctx(organizationId: string | null, role: "doctor" | "platform_owner" = "doctor"): RequestContext {
  return {
    actor: { userId: "u1", role, organizationId, sessionId: "s1", deviceId: null, permissions: [] },
    requestId: "r1",
  };
}

describe("tenant context", () => {
  it("requireOrgScope returns the caller's org", () => {
    runWithContext(ctx("clinic-A"), () => {
      expect(requireOrgScope()).toBe("clinic-A");
    });
  });

  it("requireOrgScope throws for platform owner (no clinic scope)", () => {
    runWithContext(ctx(null, "platform_owner"), () => {
      expect(() => requireOrgScope()).toThrow();
    });
  });

  it("tenantWhere injects the caller's org into the where clause", () => {
    runWithContext(ctx("clinic-A"), () => {
      expect(tenantWhere({ id: "p1" })).toEqual({ id: "p1", organizationId: "clinic-A" });
    });
  });

  it("assertSameTenant rejects cross-tenant records as not-found", () => {
    runWithContext(ctx("clinic-A"), () => {
      expect(() => assertSameTenant("clinic-B")).toThrow();
      expect(() => assertSameTenant("clinic-A")).not.toThrow();
    });
  });
});
