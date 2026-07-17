/**
 * Jarvis integration contracts.
 *
 * Jarvis is an EXTERNAL, independent AI service (developed separately in
 * Codex). This repository is only the HOST clinic application: it exposes a
 * replaceable integration slot and never contains Jarvis intelligence,
 * clinical reasoning, or exercise algorithms.
 *
 * The host talks to Jarvis exclusively through these interfaces. Today a
 * MockJarvisProvider fills the slot for preview/testing; later a
 * RemoteJarvisProvider pointed at the real Codex service replaces it via a
 * single configuration/DI change — with no UI redesign:
 *
 *     setJarvisProvider(new RemoteJarvisProvider({ endpoint: JARVIS_API_URL }))
 */

export type Lang = "ar" | "en";
export type ChatRole = "user" | "assistant";

export interface JarvisMessage {
  role: ChatRole;
  content: string;
}

/**
 * ClinicContext — the structured, read-only snapshot the host hands to
 * Jarvis (built by contextBridge). It is data, not instructions: Jarvis
 * grounds replies in it but cannot mutate the record through it.
 */
export interface ClinicContext {
  lang: Lang;
  todaySessions: number;
  doctor: { name: string; role: string };
  openPatient?: string | null;
  patients: Array<{
    id: number;
    name: string;
    age: number | string;
    gender: string;
    diagnosis: string;
    region: string;
    sessionsDone: number;
    sessionsTotal: number;
    recoveryPct: number;
    invoice: string;
    appointment: string;
    assessments: Array<{ date: string; romPct: number; mmtAvg: string; region: string }>;
  }>;
  team: Array<{ name: string; role: string }>;
  pendingInvoices: string[];
  cdssActiveInsights: Array<{ patient: string; severity: string; insight: string; status: string }>;
}

/** A single chat turn request handed to the chat adapter. */
export interface JarvisChatRequest {
  /** System framing built by the host (persona + grounding rules). */
  system: string;
  /** Prior conversation (assistant greeting excluded from model history). */
  messages: JarvisMessage[];
  /** Structured clinic snapshot (also embedded in `system` for LLM providers). */
  context: ClinicContext;
  /** Optional generation hint; providers may ignore it. */
  maxTokens?: number;
  signal?: AbortSignal;
}

/**
 * Structured command schema.
 *
 * When Jarvis wants to change patient or clinical data it must NOT do so
 * directly — it returns one or more typed commands in its response. The host
 * validates them and requires explicit clinician confirmation before any is
 * executed (see confirmation.ts). This keeps the therapist in control and
 * gives the external service a safe, auditable way to propose changes.
 */
export type JarvisCommandType =
  | "navigate"
  | "open_patient"
  | "start_assessment"
  | "add_patient"
  | "update_patient"
  | "set_insight_status"
  | "add_record_note";

export interface JarvisCommand {
  type: JarvisCommandType;
  /** Free-form, schema-validated payload (validated per type by commandSchema). */
  payload: Record<string, unknown>;
  /** Human-readable description shown in the confirmation prompt. */
  description?: string;
}

export interface JarvisChatResponse {
  text: string;
  /** Optional structured commands proposed by Jarvis (require confirmation). */
  commands?: JarvisCommand[];
}

/** Chat adapter — the text/reasoning channel. */
export interface JarvisChatAdapter {
  readonly id: string;
  complete(request: JarvisChatRequest): Promise<JarvisChatResponse>;
}

/** Voice adapter — speech synthesis (out) and recognition (in). */
export interface JarvisVoiceAdapter {
  readonly id: string;
  /** Whether speech recognition (mic input) is available in this environment. */
  recognitionSupported(): boolean;
  /** Whether speech synthesis (voice replies) is available. */
  synthesisSupported(): boolean;
  speak(text: string, opts: { lang: Lang; onStart?: () => void; onEnd?: () => void }): void;
  cancelSpeech(): void;
  /** Begin listening; returns a stop() handle. */
  startListening(opts: {
    lang: Lang;
    onResult: (transcript: string) => void;
    onEnd?: () => void;
    onError?: () => void;
  }): { stop: () => void };
}

export interface JarvisCapabilities {
  chat: boolean;
  voiceOut: boolean;
  voiceIn: boolean;
  /** True for the mock; real services set false. */
  mock: boolean;
}

/** The provider bundles the chat + voice channels behind one replaceable unit. */
export interface JarvisProvider {
  readonly id: string;
  readonly chat: JarvisChatAdapter;
  readonly voice: JarvisVoiceAdapter;
  capabilities(): JarvisCapabilities;
  /** Opening line for the boot sequence / first mount, grounded in context. */
  greeting(context: ClinicContext): string;
}
