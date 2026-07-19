import { describe, it, expect } from "vitest";
import { TOOL_REGISTRY, FORBIDDEN_ACTIONS } from "../src/modules/connector/registry.js";

describe("Jarvis connector registry (allowlist + denylist)", () => {
  it("only allowlisted actions are executable", () => {
    expect(TOOL_REGISTRY["patient.open"]).toBeDefined();
    expect(TOOL_REGISTRY["organization.create"]).toBeUndefined();
  });

  it("every tool declares a required permission", () => {
    for (const t of Object.values(TOOL_REGISTRY)) {
      expect(typeof t.requiredPermission).toBe("string");
      expect(t.requiredPermission.length).toBeGreaterThan(0);
    }
  });

  it("privilege-escalation actions are explicitly forbidden", () => {
    for (const a of ["clinicOwner.create", "platformOwner.create", "role.change", "subscription.change", "limits.increase", "deployment.approve", "security.disable"]) {
      expect(FORBIDDEN_ACTIONS.has(a)).toBe(true);
    }
  });

  it("anatomy.open requires the anatomy3D feature entitlement", () => {
    expect(TOOL_REGISTRY["anatomy.open"].requiredFeature).toBe("anatomy3D");
  });
});
