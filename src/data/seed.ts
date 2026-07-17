/**
 * Patient domain types + seed data, ported verbatim from PhysioTrack v3.
 * This is demo/seed data for the host app; in production the patient store
 * would be backed by a real API — the shapes here are the contract.
 */
import type { DxKey } from "./registries";

export type Gender = "male" | "female";
export type InvoiceStatus = "paid" | "pending";
export type RedFlag = "night_pain" | "weight_loss" | "fever" | "neuro_deficit";

export interface AssessmentRecord {
  dxKey: DxKey;
  date: string;
  romPct: number;
  mmtAvg: string;
  rom: Record<string, number>;
  mmt: Record<string, number>;
}

export interface PatientMetrics {
  romSeries: number[];
  pain: number[];
  hep: number;
  missed: number;
  flags: RedFlag[];
}

export interface Patient {
  id: number;
  name: string;
  age: number | string;
  gender: Gender;
  diag: string;
  dxKey: DxKey;
  done: number;
  total: number;
  apptDay: string;
  apptDayAr: string;
  apptTime: string;
  apptTimeAr: string;
  recovery: number;
  invoice: InvoiceStatus;
  history: AssessmentRecord[];
  metrics: PatientMetrics;
}

export function seedPatients(): Patient[] {
  return [
    { id: 1, name: "سارة المطيري", age: 63, gender: "female", diag: "CVA Left Hemiplegia", dxKey: "brain", done: 14, total: 20, apptDay: "Tue", apptDayAr: "الثلاثاء", apptTime: "9:00 AM", apptTimeAr: "9:00 ص", recovery: 72, invoice: "paid", history: [],
      metrics: { romSeries: [48, 55, 61, 68], pain: [4, 3, 3, 2], hep: 85, missed: 0, flags: [] } },
    { id: 2, name: "محمد العتيبي", age: 58, gender: "male", diag: "Total Knee Arthroplasty", dxKey: "knee", done: 8, total: 24, apptDay: "Wed", apptDayAr: "الأربعاء", apptTime: "11:00 AM", apptTimeAr: "11:00 ص", recovery: 61, invoice: "pending", history: [],
      metrics: { romSeries: [42, 45, 46, 47], pain: [6, 6, 5, 6], hep: 70, missed: 1, flags: [] } },
    { id: 3, name: "نورة الشمري", age: 67, gender: "female", diag: "Parkinson's Disease Stage II", dxKey: "brain", done: 18, total: 30, apptDay: "Thu", apptDayAr: "الخميس", apptTime: "9:00 AM", apptTimeAr: "9:00 ص", recovery: 80, invoice: "pending", history: [],
      metrics: { romSeries: [68, 73, 74, 74], pain: [3, 3, 3, 3], hep: 90, missed: 0, flags: [] } },
    { id: 4, name: "فهد القحطاني", age: 41, gender: "male", diag: "Chronic Low Back Pain", dxKey: "lower_back", done: 3, total: 12, apptDay: "Tue", apptDayAr: "الثلاثاء", apptTime: "12:30 PM", apptTimeAr: "12:30 م", recovery: 88, invoice: "paid", history: [],
      metrics: { romSeries: [52, 55, 58], pain: [7, 6, 7], hep: 40, missed: 2, flags: ["night_pain", "weight_loss"] } },
    { id: 5, name: "عبدالله الدوسري", age: 35, gender: "male", diag: "Rotator Cuff Repair", dxKey: "shoulder", done: 6, total: 16, apptDay: "Mon", apptDayAr: "الاثنين", apptTime: "10:00 AM", apptTimeAr: "10:00 ص", recovery: 84, invoice: "pending", history: [],
      metrics: { romSeries: [50, 62, 74, 84], pain: [5, 4, 3, 2], hep: 95, missed: 0, flags: [] } },
  ];
}

export function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0] ? p[0][0] : "") + (p[1] ? p[1][0] : "")).slice(0, 2);
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}
