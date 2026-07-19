/**
 * Plan catalog = CONFIG, not logic. Limits/features here are the DEFAULTS used
 * when provisioning a subscription; the authoritative values live on each
 * organization's Subscription row (and are overridable per contract). Business
 * logic must NEVER hardcode a limit (e.g. `if plan==='professional' → 14`).
 */

export interface PlanLimits {
  maxClinicOwners: number;
  maxDoctors: number;
  maxBranches: number;
  maxStorageGB: number;
  maxPatients: number | null; // null = unlimited
  maxAIRequestsPerMonth: number;
  maxConcurrentJarvisRequests: number;
  maxTrustedDevicesPerDoctor: number;
}

export interface PlanFeatures {
  jarvis: boolean;
  anatomy3D: boolean;
  advancedAnalytics: boolean;
  deviceIntegration: boolean;
  customReports: boolean;
  prioritySupport: boolean;
  dedicatedDatabase: boolean;
  dedicatedInfrastructure: boolean;
}

export interface PlanDefinition {
  planCode: string;
  displayName: string;
  currency: string;
  amount: number; // 0 for enterprise (contract-defined)
  billingCycle: string;
  limits: PlanLimits;
  features: PlanFeatures;
  /** Enterprise limits/price are set per contract from the admin platform. */
  custom: boolean;
}

export const PLAN_CATALOG: Record<string, PlanDefinition> = {
  "clinic-starter": {
    planCode: "clinic-starter",
    displayName: "Clinic Starter",
    currency: "SAR",
    amount: 2500,
    billingCycle: "monthly",
    limits: {
      maxClinicOwners: 1,
      maxDoctors: 7,
      maxBranches: 1,
      maxStorageGB: 25,
      maxPatients: null,
      maxAIRequestsPerMonth: 10000,
      maxConcurrentJarvisRequests: 3,
      maxTrustedDevicesPerDoctor: 2,
    },
    features: {
      jarvis: true, anatomy3D: true, advancedAnalytics: false, deviceIntegration: false,
      customReports: false, prioritySupport: false, dedicatedDatabase: false, dedicatedInfrastructure: false,
    },
    custom: false,
  },
  "clinic-professional": {
    planCode: "clinic-professional",
    displayName: "Clinic Professional",
    currency: "SAR",
    amount: 5000,
    billingCycle: "monthly",
    limits: {
      maxClinicOwners: 1,
      maxDoctors: 14,
      maxBranches: 2,
      maxStorageGB: 100,
      maxPatients: null,
      maxAIRequestsPerMonth: 50000,
      maxConcurrentJarvisRequests: 10,
      maxTrustedDevicesPerDoctor: 3,
    },
    features: {
      jarvis: true, anatomy3D: true, advancedAnalytics: true, deviceIntegration: true,
      customReports: true, prioritySupport: true, dedicatedDatabase: false, dedicatedInfrastructure: false,
    },
    custom: false,
  },
  "enterprise-custom": {
    planCode: "enterprise-custom",
    displayName: "Enterprise Custom",
    currency: "SAR",
    amount: 0, // contract-defined; NEVER hardcode a price
    billingCycle: "contract-defined",
    // Placeholders — real values are set per contract at provisioning time.
    limits: {
      maxClinicOwners: 1,
      maxDoctors: 50,
      maxBranches: 10,
      maxStorageGB: 1000,
      maxPatients: null,
      maxAIRequestsPerMonth: 1000000,
      maxConcurrentJarvisRequests: 50,
      maxTrustedDevicesPerDoctor: 5,
    },
    features: {
      jarvis: true, anatomy3D: true, advancedAnalytics: true, deviceIntegration: true,
      customReports: true, prioritySupport: true, dedicatedDatabase: true, dedicatedInfrastructure: true,
    },
    custom: true,
  },
};

export type FeatureKey = keyof PlanFeatures;
export type LimitKey = keyof PlanLimits;

export function planDefaults(planCode: string): PlanDefinition {
  const def = PLAN_CATALOG[planCode];
  if (!def) throw new Error(`Unknown plan code: ${planCode}`);
  return def;
}
