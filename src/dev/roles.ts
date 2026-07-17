/**
 * Development-only role list for the preview harness.
 *
 * These are the target RBAC roles (see docs/RBAC.md). NOTE: RBAC enforcement is
 * NOT implemented in the app yet — the dev role switcher only sets a preview
 * role for visual/handoff purposes. It changes no production behavior.
 */
export type DevRole =
  | "owner"
  | "clinic_admin"
  | "doctor"
  | "physiotherapist"
  | "receptionist"
  | "accountant"
  | "device_technician";

export const DEV_ROLES: Array<{ key: DevRole; en: string; ar: string; moduleGated?: "accounting" }> = [
  { key: "owner", en: "Owner", ar: "المالك" },
  { key: "clinic_admin", en: "Clinic Admin", ar: "مدير العيادة" },
  { key: "doctor", en: "Doctor", ar: "طبيب" },
  { key: "physiotherapist", en: "Physiotherapist", ar: "أخصائي علاج طبيعي" },
  { key: "receptionist", en: "Receptionist", ar: "موظف استقبال" },
  { key: "accountant", en: "Accountant", ar: "محاسب", moduleGated: "accounting" },
  { key: "device_technician", en: "Device Technician", ar: "فني أجهزة" },
];
