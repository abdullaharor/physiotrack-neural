import { useEffect, useRef, useState } from "react";
import { useAppCtx } from "../AppContext";
import { Box, S } from "../../lib/Box";
import { sx } from "../../lib/sx";
import { setConfirmHandler } from "../../integrations/jarvis/confirmation";
import type { JarvisCommand } from "../../integrations/jarvis/types";

/**
 * ConfirmHost — registers the clinician-confirmation handler for the Jarvis
 * command gate. Any data-mutating command the external Jarvis proposes is
 * surfaced here for explicit approval before it can run. The mock provider
 * never emits commands, so this stays dormant in preview — but the safety
 * boundary is fully wired for when the real Jarvis is connected.
 */
export function ConfirmHost() {
  const { state } = useAppCtx();
  const isAr = state.lang === "ar";
  const [pending, setPending] = useState<JarvisCommand | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  useEffect(() => {
    setConfirmHandler(
      (cmd) =>
        new Promise<boolean>((resolve) => {
          resolver.current = resolve;
          setPending(cmd);
        }),
    );
    return () => setConfirmHandler(null);
  }, []);

  if (!pending) return null;

  const decide = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setPending(null);
  };

  const title = isAr ? "تأكيد إجراء من Jarvis" : "Confirm a Jarvis action";
  const body =
    pending.description ||
    (isAr
      ? `يطلب Jarvis تنفيذ: ${pending.type}. هذا الإجراء يعدّل بيانات المريض/السجل ويحتاج موافقتك.`
      : `Jarvis is requesting: ${pending.type}. This modifies patient/clinical data and needs your approval.`);

  return (
    <Box sx="position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:24px;background:color-mix(in srgb, var(--color-neutral-900) 55%, transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:ptFadeIn .3s ease both">
      <div style={sx("width:420px;max-width:94vw;display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-6);border-radius:var(--radius-lg);background:color-mix(in srgb, var(--color-surface) 94%, var(--color-section-glow));border:1px solid color-mix(in srgb, var(--color-text) 14%, transparent);box-shadow:var(--shadow-lg);animation:ptDialogIn .42s cubic-bezier(.3,1.25,.5,1) both")}>
        <div style={sx("font-family:var(--font-heading);font-size:18px")}>{title}</div>
        <div style={sx("font-size:13px;opacity:0.75;line-height:1.6")}>{body}</div>
        <S sx="display:flex;gap:var(--space-2);justify-content:flex-end;margin-top:var(--space-2)">
          <button type="button" className="btn btn-secondary" onClick={() => decide(false)}>{isAr ? "رفض" : "Decline"}</button>
          <button type="button" className="btn btn-primary" onClick={() => decide(true)}>{isAr ? "موافقة" : "Approve"}</button>
        </S>
      </div>
    </Box>
  );
}
