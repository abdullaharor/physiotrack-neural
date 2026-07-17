/** Shared patient-row view-model builder (used by dashboard, patients,
 *  appointments, invoices). Mirrors v3's `mkRow`. */
import type { Strings } from "../i18n/strings";
import { initials, type Patient } from "../data/seed";

export interface PatientRowVM {
  id: number;
  name: string;
  diag: string;
  initials: string;
  pct: number;
  sessionsLabel: string;
  apptDay: string;
  apptTime: string;
  invoiceLabel: string;
  invoiceTagClass: string;
  done: number;
  delay: string;
}

export function mkRow(p: Patient, i: number, t: Strings, isAr: boolean): PatientRowVM {
  return {
    id: p.id,
    name: p.name,
    diag: p.diag,
    initials: initials(p.name),
    pct: Math.round((p.done / p.total) * 100),
    sessionsLabel: p.done + "/" + p.total + " " + t.sessions,
    apptDay: isAr ? p.apptDayAr : p.apptDay,
    apptTime: isAr ? p.apptTimeAr : p.apptTime,
    invoiceLabel: p.invoice === "pending" ? t.pending : t.paid,
    invoiceTagClass: p.invoice === "pending" ? "tag-outline" : "tag-accent",
    done: p.done,
    delay: Math.min(i * 55, 440) + "ms",
  };
}
