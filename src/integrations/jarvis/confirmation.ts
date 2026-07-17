/**
 * Clinician confirmation gate.
 *
 * No Jarvis-proposed command that mutates patient or clinical data may run
 * without the therapist explicitly approving it. The host registers a handler
 * (a confirmation dialog) here; the gate routes every data-mutating command
 * through it and only calls the executor on an explicit "yes". Read-only
 * commands (navigate / open_patient) pass straight through.
 *
 * This is deliberately UI-agnostic so the same gate works in the app, in
 * tests, and in headless contexts.
 */
import type { JarvisCommand } from "./types";
import { requiresConfirmation } from "./commandSchema";

export type ConfirmHandler = (cmd: JarvisCommand) => Promise<boolean>;
export type CommandExecutor = (cmd: JarvisCommand) => void;

let confirmHandler: ConfirmHandler | null = null;

/** Host registers how confirmation is requested (e.g. opens a dialog). */
export function setConfirmHandler(handler: ConfirmHandler | null): void {
  confirmHandler = handler;
}

/**
 * Run a Jarvis command through the safety gate.
 * - read-only commands execute immediately;
 * - data-mutating commands require an explicit clinician "yes";
 * - if no handler is registered, mutating commands are refused (fail-closed).
 * Returns whether the command was executed.
 */
export async function runCommand(cmd: JarvisCommand, execute: CommandExecutor): Promise<boolean> {
  if (!requiresConfirmation(cmd)) {
    execute(cmd);
    return true;
  }
  if (!confirmHandler) {
    // Fail closed: never mutate clinical data without an approval path.
    if (typeof console !== "undefined") {
      console.warn("[Jarvis] refused data-mutating command — no confirmation handler registered:", cmd.type);
    }
    return false;
  }
  const approved = await confirmHandler(cmd);
  if (approved) execute(cmd);
  return approved;
}
