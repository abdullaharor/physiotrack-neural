import { useAppCtx } from "../AppContext";
import { Box, S } from "../../lib/Box";
import { sx } from "../../lib/sx";

const SPARKLE = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" /></svg>
);

/** Jarvis clinical-assistant layer — floating chat panel + FAB. This is the
 *  preserved v3 chat UI (lines 614–669); it is wired entirely to the injected
 *  Jarvis provider (mock today, external Codex later) and contains no
 *  assistant logic of its own. */
export function JarvisLayer() {
  const { state, t, jarvis } = useAppCtx();
  const isAr = state.lang === "ar";

  const chips = [
    { label: t.chipSchedule },
    { label: t.chipReassess },
    { label: t.chipInvoices },
    ...(state.profileId != null && state.modal ? [{ label: t.chipPatient }] : []),
  ];

  const msgStyle = (role: "user" | "assistant") => ({
    align: role === "user" ? "flex-end" : "flex-start",
    bg: role === "user" ? "color-mix(in srgb, var(--color-accent) 13%, transparent)" : "color-mix(in srgb, var(--color-bg) 55%, transparent)",
    border: role === "user" ? "color-mix(in srgb, var(--color-accent) 35%, transparent)" : "var(--color-divider)",
  });

  return (
    <>
      {state.jarvisMounted && (
        <div style={sx(`position:fixed;bottom:88px;inset-inline-end:22px;z-index:60;width:min(390px, calc(100vw - 44px));display:flex;flex-direction:column;border-radius:var(--radius-lg);background:color-mix(in srgb, var(--color-surface) 92%, var(--color-section-glow));backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid color-mix(in srgb, var(--color-text) 14%, transparent);box-shadow:var(--shadow-lg);overflow:hidden;animation:${state.jarvisClosing ? "ptDialogOut" : "ptDialogIn"} .38s cubic-bezier(.3,1.25,.5,1) both`)} data-screen-label="jarvis">
          <S sx="display:flex;align-items:center;gap:11px;padding:var(--space-4);border-bottom:1px solid var(--color-divider)">
            <span style={sx("position:relative;width:36px;height:36px;flex-shrink:0;display:grid;place-items:center;border-radius:50%;border:1px solid var(--color-accent);color:var(--color-accent);background:color-mix(in srgb, var(--color-accent) 9%, transparent);animation:ptBreathe 4s ease-in-out infinite")}>{SPARKLE}</span>
            <span style={sx("flex:1;min-width:0")}>
              <span style={sx("display:block;font-family:var(--font-heading);font-weight:500;font-size:15px")}>Jarvis</span>
              <span style={sx("display:flex;align-items:center;gap:6px;font-size:10.5px;opacity:0.55;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>
                <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);flex-shrink:0")} />
                <span style={sx("white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{t.jarvisRole}</span>
              </span>
            </span>
            <button type="button" className="btn btn-secondary btn-icon" onClick={jarvis.expand} title="JARVIS OS">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7.5 7.5M3 21l7.5-7.5" /></svg>
            </button>
            <button type="button" className="btn btn-icon" onClick={jarvis.toggleVoice} title={t.jarvisVoice} style={sx(`border:1px solid ${state.voiceOn ? "var(--color-accent)" : "var(--color-divider)"};color:${state.voiceOn ? "var(--color-accent)" : "color-mix(in srgb, var(--color-text) 55%, transparent)"}`)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2.5" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5" /></svg>
            </button>
            <button type="button" className="btn btn-secondary btn-icon" onClick={jarvis.toggle} aria-label="close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </S>

          <div ref={jarvis.msgsRef} style={sx("height:min(340px, 42vh);overflow-y:auto;overflow-x:hidden;padding:var(--space-4);display:flex;flex-direction:column;gap:10px")}>
            {state.jarvisMsgs.map((m, i) => {
              const s = msgStyle(m.role);
              return (
                <div key={i} dir="auto" style={sx(`align-self:${s.align};max-width:86%;padding:9px 13px;border-radius:12px;background:${s.bg};border:1px solid ${s.border};font-size:13px;line-height:1.65;white-space:pre-wrap;animation:ptFadeSlide .35s cubic-bezier(.22,.8,.36,1) both`)}>{m.text}</div>
              );
            })}
            {state.jarvisBusy && (
              <div style={sx("align-self:flex-start;display:flex;gap:4px;padding:12px 14px;border-radius:12px;background:color-mix(in srgb, var(--color-bg) 55%, transparent);border:1px solid var(--color-divider)")}>
                <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);animation:ptBounce 1.1s ease-in-out infinite")} />
                <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);animation:ptBounce 1.1s ease-in-out 0.15s infinite")} />
                <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);animation:ptBounce 1.1s ease-in-out 0.3s infinite")} />
              </div>
            )}
          </div>

          <div style={sx("display:flex;flex-wrap:wrap;gap:6px;padding:0 var(--space-4) var(--space-3)")}>
            {chips.map((c) => (
              <Box
                key={c.label}
                onClick={() => jarvis.send(c.label)}
                sx="font-size:11px;padding:5px 11px;border-radius:999px;border:1px solid var(--color-divider);cursor:pointer;opacity:0.8;transition:border-color .25s,color .25s,transform .25s cubic-bezier(.34,1.6,.64,1);white-space:nowrap"
                hover="border-color:var(--color-accent);color:var(--color-accent)"
                active="transform:scale(.94)"
              >{c.label}</Box>
            ))}
          </div>

          <div style={sx("display:flex;gap:8px;padding:var(--space-3) var(--space-4) var(--space-4);border-top:1px solid var(--color-divider)")}>
            <input
              className="input"
              value={state.jarvisInput}
              onInput={(e) => jarvis.setInput((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => { if (e.key === "Enter") jarvis.send(); }}
              placeholder={t.jarvisPlaceholder}
              style={sx("flex:1;background:color-mix(in srgb, var(--color-bg) 55%, transparent)")}
            />
            <button type="button" className="btn btn-primary btn-icon" onClick={() => jarvis.send()} aria-label="send" style={{ width: 36, height: 36, flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={sx(`transform:${isAr ? "scaleX(-1)" : "none"}`)}><path d="M3.5 11.5L20.5 3.5 14 20.5l-2.5-6.5z" /><path d="M20.5 3.5L11.5 14" /></svg>
            </button>
          </div>
        </div>
      )}

      <Box
        onClick={jarvis.toggle}
        sx="position:fixed;bottom:22px;inset-inline-end:22px;z-index:60;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:color-mix(in srgb, var(--color-surface) 82%, var(--color-section-glow));backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid var(--color-accent);color:var(--color-accent);animation:ptBreathe 4.5s ease-in-out infinite;transition:transform .3s cubic-bezier(.34,1.6,.64,1)"
        hover="transform:scale(1.08)"
        active="transform:scale(.9)"
        title="Jarvis"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" /></svg>
        {state.jarvisUnread && !state.jarvisMounted && (
          <span style={sx("position:absolute;top:3px;inset-inline-end:3px;width:10px;height:10px;border-radius:50%;background:var(--color-accent);box-shadow:0 0 8px var(--color-accent);border:2px solid var(--color-bg)")} />
        )}
      </Box>
    </>
  );
}
