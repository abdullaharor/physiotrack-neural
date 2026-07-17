/**
 * Registries — single source of truth for nav, clinical protocols, the
 * device catalog and the anatomy module manifest. Ported verbatim from
 * PhysioTrack v3. Adding a nav view, a device plugin or an assessment
 * protocol means adding one entry here; the UI renders from these.
 *
 * Note on boundaries: the device catalog and anatomy manifest below are the
 * raw reference data. At runtime they are surfaced through the
 * MedicalDeviceProvider and AnatomyAtlasProvider integration boundaries
 * (see src/integrations/*), so a real plugin backend can replace the source
 * without the UI changing.
 */
import type { Lang } from "../i18n/strings";

export type NavKey =
  | "dashboard" | "patients" | "appointments" | "invoices"
  | "anatomy" | "devices" | "team";

export const NAV_REGISTRY: Array<{
  key: NavKey; labelKey: string; subKey: string; icon: string; soon?: boolean;
}> = [
  { key: "dashboard", labelKey: "navDashboard", subKey: "subDashboard", icon: "dashboard" },
  { key: "patients", labelKey: "navPatients", subKey: "subPatients", icon: "patients" },
  { key: "appointments", labelKey: "navAppointments", subKey: "subAppointments", icon: "appointments" },
  { key: "invoices", labelKey: "navInvoices", subKey: "subInvoices", icon: "invoices" },
  { key: "anatomy", labelKey: "navAnatomy", subKey: "subAnatomy", icon: "anatomy", soon: true },
  { key: "devices", labelKey: "navDevices", subKey: "subDevices", icon: "devices" },
  { key: "team", labelKey: "navTeam", subKey: "subTeam", icon: "team" },
];

/** Anatomy module slot — a future 3D engine mounts against this manifest
 *  (same shape as a device plugin: the app core never changes). */
export const ANATOMY_MODULE = {
  id: "atlas-3d", status: "coming_soon" as const, engine: "three.js",
  dataset: "Z-Anatomy (CC-BY-SA 4.0)", entry: null as string | null,
  featureKeys: ["anatomyF1", "anatomyF2", "anatomyF3", "anatomyF4"],
};

export type DeviceStatus = "connected" | "ready" | "planned";
export type DeviceCat = "measure" | "sensors" | "therapy" | "connect";

export const DEVICE_REGISTRY: Array<{
  cat: DeviceCat; en: string; ar: string; conn: string; status: DeviceStatus;
}> = [
  { cat: "measure", en: "Digital Goniometer", ar: "مقياس زوايا رقمي", conn: "BLE", status: "ready" },
  { cat: "measure", en: "Hand Dynamometer", ar: "مقياس قوة القبضة", conn: "BLE", status: "ready" },
  { cat: "measure", en: "Force Plates", ar: "منصات قياس القوة", conn: "Wi-Fi", status: "planned" },
  { cat: "measure", en: "Balance Platform", ar: "منصة التوازن", conn: "Wi-Fi", status: "planned" },
  { cat: "sensors", en: "EMG Sensors", ar: "حساسات EMG", conn: "BLE", status: "ready" },
  { cat: "sensors", en: "Inertial Sensors (IMU)", ar: "حساسات الحركة (IMU)", conn: "BLE", status: "ready" },
  { cat: "sensors", en: "Motion Capture System", ar: "نظام التقاط الحركة", conn: "Wi-Fi", status: "planned" },
  { cat: "sensors", en: "Pressure Sensors", ar: "حساسات الضغط", conn: "BLE", status: "planned" },
  { cat: "sensors", en: "Wearables", ar: "الأجهزة القابلة للارتداء", conn: "BLE", status: "ready" },
  { cat: "therapy", en: "TENS Device", ar: "جهاز TENS", conn: "BT", status: "ready" },
  { cat: "therapy", en: "NMES Device", ar: "جهاز NMES", conn: "BT", status: "planned" },
  { cat: "therapy", en: "Ultrasound Therapy", ar: "العلاج بالموجات فوق الصوتية", conn: "USB", status: "planned" },
  { cat: "therapy", en: "Laser Therapy", ar: "العلاج بالليزر", conn: "USB", status: "planned" },
  { cat: "therapy", en: "Shockwave Therapy", ar: "العلاج بالموجات التصادمية", conn: "USB", status: "planned" },
  { cat: "connect", en: "Bluetooth Medical Devices", ar: "أجهزة طبية بلوتوث", conn: "BT", status: "ready" },
  { cat: "connect", en: "BLE Sensor Mesh", ar: "شبكة حساسات BLE", conn: "BLE", status: "ready" },
  { cat: "connect", en: "Wi-Fi Medical Equipment", ar: "معدات طبية Wi-Fi", conn: "Wi-Fi", status: "planned" },
  { cat: "connect", en: "Smart Rehab Equipment", ar: "معدات تأهيل ذكية", conn: "Wi-Fi", status: "planned" },
];

export const DEVICE_CATEGORIES: Array<{ id: DeviceCat; en: string; ar: string }> = [
  { id: "measure", en: "Measurement & Assessment", ar: "القياس والتقييم" },
  { id: "sensors", en: "Sensors & Motion", ar: "الحساسات والحركة" },
  { id: "therapy", en: "Therapy Modalities", ar: "أجهزة العلاج" },
  { id: "connect", en: "Connectivity", ar: "الاتصال" },
];

export const PAIRED_DEMO = [
  { name: "Goniometer DG-200", metaEn: "BLE · battery 84%", metaAr: "BLE · البطارية 84%", icon: "angle" },
  { name: "IMU Node ×3", metaEn: "BLE mesh · 120 Hz", metaAr: "شبكة BLE · ‏120 هرتز", icon: "wave" },
];

export type DxKey = "lower_back" | "knee" | "shoulder" | "brain";

export const DX_META: Record<DxKey, Record<Lang, { label: string; desc: string }>> = {
  lower_back: { en: { label: "Lower Back", desc: "Lumbar spine & lower limb" }, ar: { label: "أسفل الظهر", desc: "الفقرات القطنية والطرف السفلي" } },
  knee: { en: { label: "Knee", desc: "Knee & lower limb" }, ar: { label: "الركبة", desc: "الركبة والطرف السفلي" } },
  shoulder: { en: { label: "Shoulder", desc: "Shoulder & upper limb" }, ar: { label: "الكتف", desc: "الكتف والطرف العلوي" } },
  brain: { en: { label: "Neuro / Functional", desc: "Neurological & functional assessment" }, ar: { label: "عصبي", desc: "تقييم عصبي ووظيفي" } },
};

export type Motion = { name: string; normal: number };
export type Joint = { name: string; motions: Motion[] };
export type ClinicalProtocol = { joints: Joint[]; muscles: string[] };

export const CLINICAL_DATA: Record<DxKey, ClinicalProtocol> = {
  lower_back: { joints: [
    { name: "Lumbar Spine", motions: [{ name: "Flexion", normal: 60 }, { name: "Extension", normal: 25 }, { name: "Lateral Flexion R", normal: 25 }, { name: "Rotation R", normal: 30 }] },
    { name: "Hip", motions: [{ name: "Flexion", normal: 120 }, { name: "Extension", normal: 30 }, { name: "Abduction", normal: 45 }] },
    { name: "Knee", motions: [{ name: "Flexion", normal: 135 }] },
    { name: "Ankle", motions: [{ name: "Dorsiflexion", normal: 20 }, { name: "Plantarflexion", normal: 50 }] } ],
    muscles: ["Hip Flexors (Iliopsoas)", "Hip Extensors (Glut Max)", "Knee Extensors (Quads)", "Knee Flexors (Hamstrings)", "Ankle DF (Tibialis Ant)", "Core Stabilizers"] },
  knee: { joints: [
    { name: "Knee", motions: [{ name: "Flexion", normal: 135 }, { name: "Extension", normal: 0 }, { name: "Hyperextension", normal: 10 }] },
    { name: "Hip", motions: [{ name: "Flexion", normal: 120 }, { name: "Abduction", normal: 45 }] },
    { name: "Ankle", motions: [{ name: "Dorsiflexion", normal: 20 }] } ],
    muscles: ["Quadriceps (VMO, VL, RF)", "Hamstrings", "Gastrocnemius", "Hip Abductors", "Patellar Mobility"] },
  shoulder: { joints: [
    { name: "Shoulder (GH Joint)", motions: [{ name: "Flexion", normal: 180 }, { name: "Abduction", normal: 180 }, { name: "IR", normal: 70 }, { name: "ER", normal: 90 }] },
    { name: "Elbow", motions: [{ name: "Flexion", normal: 150 }, { name: "Supination", normal: 80 }] },
    { name: "Wrist", motions: [{ name: "Flexion", normal: 80 }, { name: "Extension", normal: 70 }] } ],
    muscles: ["Deltoid (Ant/Mid/Post)", "Rotator Cuff", "Pectoralis Major", "Serratus Anterior", "Trapezius", "Biceps Brachii"] },
  brain: { joints: [
    { name: "Upper Limb (Affected Side)", motions: [{ name: "Shoulder Flexion", normal: 180 }, { name: "Elbow Flexion", normal: 150 }, { name: "Wrist Extension", normal: 70 }] },
    { name: "Lower Limb (Affected Side)", motions: [{ name: "Hip Flexion", normal: 120 }, { name: "Knee Flexion", normal: 135 }, { name: "Ankle DF", normal: 20 }] } ],
    muscles: ["Hip Flexors (Affected)", "Knee Extensors (Affected)", "Shoulder Abductors", "Core / Trunk Stability"] },
};

export const TEAM = [
  { en: "Dr. Salma Al-Rashed", ar: "د. سلمى الراشد", roleEn: "Physiotherapist · Consultant", roleAr: "أخصائية علاج طبيعي · استشاري" },
  { en: "Dr. Khalid Al-Harbi", ar: "د. خالد الحربي", roleEn: "Physiotherapist", roleAr: "أخصائي علاج طبيعي" },
  { en: "Reem Al-Salem", ar: "أ. ريم السالم", roleEn: "Appointments Coordinator", roleAr: "منسقة المواعيد" },
];
