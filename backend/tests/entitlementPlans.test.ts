import { describe, it, expect } from "vitest";
import { PLAN_CATALOG, planDefaults } from "../src/entitlement/plans.js";

describe("plan catalog (config-driven; no hardcoded limits in logic)", () => {
  it("starter allows 1 owner and 7 doctors from config", () => {
    const p = planDefaults("clinic-starter");
    expect(p.limits.maxClinicOwners).toBe(1);
    expect(p.limits.maxDoctors).toBe(7);
  });

  it("professional allows 14 doctors from config", () => {
    expect(planDefaults("clinic-professional").limits.maxDoctors).toBe(14);
  });

  it("enterprise is custom with a contract-defined (zero placeholder) price", () => {
    const p = planDefaults("enterprise-custom");
    expect(p.custom).toBe(true);
    expect(p.amount).toBe(0);
  });

  it("every plan defines the full limit + feature shape", () => {
    for (const code of Object.keys(PLAN_CATALOG)) {
      const p = planDefaults(code);
      expect(p.limits).toHaveProperty("maxDoctors");
      expect(p.limits).toHaveProperty("maxAIRequestsPerMonth");
      expect(p.features).toHaveProperty("jarvis");
      expect(p.features).toHaveProperty("anatomy3D");
    }
  });

  it("throws on unknown plan code", () => {
    expect(() => planDefaults("nope")).toThrow();
  });
});
