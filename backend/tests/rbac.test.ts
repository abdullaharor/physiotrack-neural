import { describe, it, expect } from "vitest";
import { runWithContext, type RequestContext } from "../src/tenant/context.js";
import { can } from "../src/rbac/policy.js";
import { PERMISSIONS, effectivePermissions } from "../src/rbac/permissions.js";
import type { UserRole } from "@prisma/client";

function ctx(role: UserRole, permissions: string[] = []): RequestContext {
  return {
    actor: { userId: "u", role, organizationId: role === "platform_owner" ? null : "c", sessionId: "s", deviceId: null, permissions },
    requestId: "r",
  };
}

describe("RBAC (deny-by-default)", () => {
  it("doctor can read patients but cannot create doctors", () => {
    runWithContext(ctx("doctor"), () => {
      expect(can(PERMISSIONS.patientsRead)).toBe(true);
      expect(can(PERMISSIONS.doctorsCreate)).toBe(false);
      expect(can(PERMISSIONS.organizationsCreate)).toBe(false);
    });
  });

  it("clinic owner can create doctors but not organizations", () => {
    runWithContext(ctx("clinic_owner"), () => {
      expect(can(PERMISSIONS.doctorsCreate)).toBe(true);
      expect(can(PERMISSIONS.organizationsCreate)).toBe(false);
    });
  });

  it("platform owner can create organizations", () => {
    runWithContext(ctx("platform_owner"), () => {
      expect(can(PERMISSIONS.organizationsCreate)).toBe(true);
    });
  });

  it("jarvis service account holds no standing permissions", () => {
    expect(effectivePermissions("jarvis_service", []).size).toBe(0);
  });

  it("explicit grants extend role defaults", () => {
    runWithContext(ctx("doctor", [PERMISSIONS.clinicSettingsManage]), () => {
      expect(can(PERMISSIONS.clinicSettingsManage)).toBe(true);
    });
  });
});
