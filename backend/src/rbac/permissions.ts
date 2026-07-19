import type { UserRole } from "@prisma/client";

/** Canonical permission strings (deny-by-default; nothing implicit). */
export const PERMISSIONS = {
  // Doctor
  patientsRead: "patients.read",
  patientsCreate: "patients.create",
  patientsUpdate: "patients.update",
  appointmentsRead: "appointments.read",
  appointmentsManage: "appointments.manage",
  sessionsRead: "sessions.read",
  sessionsStart: "sessions.start",
  sessionsComplete: "sessions.complete",
  anatomyUse: "anatomy.use",
  jarvisUse: "jarvis.use",
  clinicalSuggestionsReview: "clinicalSuggestions.review",
  // Clinic Owner
  doctorsCreate: "doctors.create",
  doctorsSuspend: "doctors.suspend",
  doctorsRevoke: "doctors.revoke",
  devicesApprove: "devices.approve",
  devicesRevoke: "devices.revoke",
  clinicPermissionsManage: "clinic.permissions.manage",
  clinicSecurityLogsRead: "clinic.securityLogs.read",
  clinicSettingsManage: "clinic.settings.manage",
  subscriptionView: "subscription.view",
  subscriptionUpgradeRequest: "subscription.upgrade.request",
  // Platform Owner
  organizationsCreate: "organizations.create",
  organizationsSuspend: "organizations.suspend",
  organizationsManage: "organizations.manage",
  clinicOwnersCreate: "clinicOwners.create",
  subscriptionsManage: "subscriptions.manage",
  plansManage: "plans.manage",
  platformSecurityLogsRead: "platform.securityLogs.read",
  deploymentApprove: "deployment.approve",
  releaseManage: "release.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const P = PERMISSIONS;

/** Default permission set per role. Extra grants are stored on the user. */
export const ROLE_DEFAULTS: Record<UserRole, Permission[]> = {
  doctor: [
    P.patientsRead, P.patientsCreate, P.patientsUpdate,
    P.appointmentsRead, P.appointmentsManage,
    P.sessionsRead, P.sessionsStart, P.sessionsComplete,
    P.anatomyUse, P.jarvisUse, P.clinicalSuggestionsReview,
  ],
  clinic_owner: [
    P.doctorsCreate, P.doctorsSuspend, P.doctorsRevoke,
    P.devicesApprove, P.devicesRevoke,
    P.clinicPermissionsManage, P.clinicSecurityLogsRead, P.clinicSettingsManage,
    P.subscriptionView, P.subscriptionUpgradeRequest,
  ],
  platform_owner: [
    P.organizationsCreate, P.organizationsSuspend, P.organizationsManage,
    P.clinicOwnersCreate, P.subscriptionsManage, P.plansManage,
    P.platformSecurityLogsRead, P.deploymentApprove, P.releaseManage,
  ],
  // Jarvis holds NO standing permissions; it acts within the doctor's grants
  // per command, always re-checked by the backend.
  jarvis_service: [],
};

/** Effective permissions = role defaults ∪ explicit grants. */
export function effectivePermissions(role: UserRole, explicit: string[]): Set<string> {
  return new Set<string>([...ROLE_DEFAULTS[role], ...explicit]);
}
