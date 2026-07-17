/**
 * contextBridge — builds the read-only ClinicContext that the host hands to
 * Jarvis, and the system framing string for LLM-backed providers.
 *
 * This is the ONLY place clinic data crosses into the Jarvis boundary. It is
 * a projection of the host's state — never a live reference — so the external
 * service can read but not mutate the record. Ported from v3's `_jarvisSystem`
 * (the persona + grounding rules are preserved verbatim).
 */
import type { ClinicContext, Lang } from "./types";
import type { Patient } from "../../data/seed";

export interface ContextInput {
  lang: Lang;
  patients: Patient[];
  team: Array<{ en: string; roleEn: string }>;
  activeInsights: Array<{ patientName: string; sev: string; title: string; status: string | null }>;
  openPatientName?: string | null;
  todaySessions?: number;
}

export function buildClinicContext(input: ContextInput): ClinicContext {
  const { lang, patients, team, activeInsights } = input;
  return {
    lang,
    todaySessions: input.todaySessions ?? 5,
    doctor: { name: "Dr. Salma Al-Rashed", role: "Consultant Physiotherapist" },
    openPatient: input.openPatientName ?? null,
    patients: patients.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      diagnosis: p.diag,
      region: p.dxKey,
      sessionsDone: p.done,
      sessionsTotal: p.total,
      recoveryPct: p.recovery,
      invoice: p.invoice,
      appointment: p.apptDay + " " + p.apptTime,
      assessments: p.history.slice(0, 2).map((h) => ({ date: h.date, romPct: h.romPct, mmtAvg: h.mmtAvg, region: h.dxKey })),
    })),
    team: team.map((m) => ({ name: m.en, role: m.roleEn })),
    pendingInvoices: patients.filter((p) => p.invoice === "pending").map((p) => p.name),
    cdssActiveInsights: activeInsights.map((i) => ({
      patient: i.patientName, severity: i.sev, insight: i.title, status: i.status || "open",
    })),
  };
}

/**
 * buildSystemPrompt — the persona + grounding rules a remote LLM Jarvis would
 * receive. Preserved from v3 so a real provider behaves identically. The mock
 * provider ignores this and answers deterministically instead.
 */
export function buildSystemPrompt(ctx: ClinicContext): string {
  const isAr = ctx.lang === "ar";
  const data = {
    today_sessions: ctx.todaySessions,
    patients: ctx.patients.map((p) => ({
      name: p.name, age: p.age, gender: p.gender, diagnosis: p.diagnosis, region: p.region,
      sessions_done: p.sessionsDone, sessions_total: p.sessionsTotal, recovery_pct: p.recoveryPct,
      invoice: p.invoice, appointment: p.appointment, assessments: p.assessments,
    })),
    team: ctx.team,
    pending_invoices: ctx.pendingInvoices,
    cdss_active_insights: ctx.cdssActiveInsights,
  };
  return (
    "You are Jarvis (جارفس), the permanent AI clinical assistant inside PhysioTrack, a physiotherapy clinic app. You work alongside Dr. Salma Al-Rashed (د. سلمى الراشد), consultant physiotherapist in Saudi Arabia.\n" +
    "Personality: professional, intelligent, calm, respectful, confident, concise — an experienced senior clinical assistant. Never robotic, never overly casual.\n" +
    (isAr
      ? 'Respond in Arabic: Modern Standard Arabic with a natural, professional Saudi conversational flavor (like: "عندك اليوم 5 جلسات", "فيه مريض يحتاج إعادة تقييم"). Clinical test names and diagnoses may stay in English.\n'
      : "Respond in English.\n") +
    "Keep replies to 1–3 short sentences unless asked for detail. Use ONLY the clinic data below — never ask for information already in it. Proactively reference previous sessions, progress, reassessments and the CDSS insights. When relevant, suggest evidence-based next steps, objective outcome measures, and flag risks. Never make a definitive diagnosis; recommendations are suggestions that require the therapist's confirmation. If asked something outside the data, say so briefly.\n" +
    "Ground clinical suggestions in evidence-based physiotherapy practice (APTA, NICE, JOSPT guidelines, pain science, biomechanics); name the relevant test or outcome measure and give a confidence level (high/moderate/low) when making a clinical suggestion. Never fabricate data.\n" +
    "If you propose changing clinic data, return it as a structured command for the therapist to confirm — never assume it is done.\n" +
    "CLINIC DATA (JSON): " + JSON.stringify(data) + "\n" +
    (ctx.openPatient ? "The therapist currently has this patient's profile open: " + ctx.openPatient + ". Prioritize their context.\n" : "")
  );
}
