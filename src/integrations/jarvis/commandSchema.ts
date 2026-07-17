/**
 * Structured command schema + validation for Jarvis-proposed actions.
 *
 * The external Jarvis service can only *propose* changes to clinic data by
 * returning typed commands. The host validates each command's shape here
 * before it is ever shown to the clinician for confirmation. Anything that
 * fails validation is dropped. This is the secure boundary between the
 * external AI's suggestions and the host's data.
 */
import type { JarvisCommand, JarvisCommandType } from "./types";

/** Which command types mutate patient/clinical data (⇒ require confirmation). */
export const DATA_MUTATING: Record<JarvisCommandType, boolean> = {
  navigate: false,
  open_patient: false,
  start_assessment: true,
  add_patient: true,
  update_patient: true,
  set_insight_status: true,
  add_record_note: true,
};

type Validator = (payload: Record<string, unknown>) => boolean;

const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

const VALIDATORS: Record<JarvisCommandType, Validator> = {
  navigate: (p) => isStr(p.view),
  open_patient: (p) => isNum(p.patientId),
  start_assessment: (p) => isNum(p.patientId) && isStr(p.dxKey),
  add_patient: (p) => isStr(p.name),
  update_patient: (p) => isNum(p.patientId) && typeof p.changes === "object" && p.changes != null,
  set_insight_status: (p) => isStr(p.insightKey) && isStr(p.status),
  add_record_note: (p) => isStr(p.insightKey) && isStr(p.note),
};

/** Validate one command; returns it typed, or null if malformed/unknown. */
export function validateCommand(raw: unknown): JarvisCommand | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const type = c.type as JarvisCommandType;
  if (!type || !(type in VALIDATORS)) return null;
  const payload = (c.payload ?? {}) as Record<string, unknown>;
  if (!VALIDATORS[type](payload)) return null;
  return {
    type,
    payload,
    description: typeof c.description === "string" ? c.description : undefined,
  };
}

/** Validate a batch, dropping anything malformed. */
export function validateCommands(raw: unknown): JarvisCommand[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(validateCommand).filter((c): c is JarvisCommand => c != null);
}

export function requiresConfirmation(cmd: JarvisCommand): boolean {
  return DATA_MUTATING[cmd.type] === true;
}
