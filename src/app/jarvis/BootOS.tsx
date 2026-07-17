import { useAppCtx } from "../AppContext";
import { S } from "../../lib/Box";
import { sx } from "../../lib/sx";
import { initials } from "../../data/seed";
import { SEV_META } from "../../cdss/engine";

const SPARKLE_LG = (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" /></svg>
);

const PARTICLES = [
  { left: "12%", top: "72%", size: "3px", dur: "8s", delay: "0s" },
  { left: "22%", top: "85%", size: "2px", dur: "10s", delay: "1.2s" },
  { left: "34%", top: "78%", size: "2.5px", dur: "9s", delay: "2.5s" },
  { left: "48%", top: "88%", size: "2px", dur: "11s", delay: "0.6s" },
  { left: "60%", top: "80%", size: "3px", dur: "8.5s", delay: "3.1s" },
  { left: "72%", top: "86%", size: "2px", dur: "10.5s", delay: "1.8s" },
  { left: "83%", top: "74%", size: "2.5px", dur: "9.5s", delay: "0.9s" },
  { left: "91%", top: "82%", size: "2px", dur: "8.8s", delay: "2.2s" },
];
const BOOT_LABELS = ["AI Online", "Clinic Connected", "Patient Database Synced", "Oxford Knowledge Loaded", "Harvard Knowledge Loaded", "Appointments Loaded"];
const TRACES = [
  { d: "M0 140 H360 V400 H510", delay: "0.25s" }, { d: "M0 620 H300 V440 H510", delay: "0.45s" },
  { d: "M420 0 V220 H575 V320", delay: "0.6s" }, { d: "M780 0 V180 H640 V320", delay: "0.35s" },
  { d: "M1200 200 H850 V400 H690", delay: "0.5s" }, { d: "M1200 640 H880 V440 H690", delay: "0.7s" },
  { d: "M500 800 V600 H565 V480", delay: "0.55s" }, { d: "M720 800 V630 H655 V480", delay: "0.8s" },
];
const NODES = [
  { cx: 510, cy: 400, d: "1.9s" }, { cx: 510, cy: 440, d: "2.1s" }, { cx: 575, cy: 320, d: "2.2s" }, { cx: 640, cy: 320, d: "2.0s" },
  { cx: 690, cy: 400, d: "2.15s" }, { cx: 690, cy: 440, d: "2.3s" }, { cx: 565, cy: 480, d: "2.25s" }, { cx: 655, cy: 480, d: "2.4s" },
];

/** JARVIS OS — the fullscreen boot / launch experience: circuit trace,
 *  particles, core sphere, status log, HUD panels and the wide chat dock.
 *  Faithful to v3 lines 671–842; all chat/voice run through the provider. */
export function BootOS() {
  const { state, t, jarvis, activeInsights } = useAppCtx();
  const isAr = state.lang === "ar";
  const osPhase = state.osPhase;
  if (osPhase === "done") return null;

  const { patients } = state;
  const parseT = (appt: string) => {
    const m = /(\d+):(\d+)\s*(AM|PM)/.exec(appt);
    if (!m) return 99;
    let h = +m[1] % 12;
    if (m[3] === "PM") h += 12;
    return h + +m[2] / 60;
  };
  const byTime = patients.slice().sort((a, b) => parseT(a.apptTime) - parseT(b.apptTime));
  const allInsights = activeInsights();
  const flaggedP = patients.find((p) => p.metrics.flags.length);
  const behindP = patients.slice().sort((a, b) => a.done - b.done)[0];
  const pendingCount = patients.filter((p) => p.invoice === "pending").length;

  const osHud = osPhase === "hud" || osPhase === "chat" || osPhase === "out";
  const osChat = osPhase === "chat";
  const hud = (n: number) => state.hudStep >= n;
  const apptTime = (p: typeof patients[number]) => (isAr ? p.apptTimeAr : p.apptTime);
  const apptDay = (p: typeof patients[number]) => (isAr ? p.apptDayAr : p.apptDay);

  const osStatusLabel = state.listening ? t.osListening : state.speakingNow ? t.osSpeaking : t.osOnline;
  const hudNotifs = [
    flaggedP ? { color: SEV_META.red.color, text: isAr ? "راية حمراء محتملة لدى " + flaggedP.name + " — تُنصح مراجعة طبية عاجلة" : "Potential red flag for " + flaggedP.name + " — urgent medical review advised" } : null,
    { color: SEV_META.yellow.color, text: isAr ? behindP.name + " يحتاج إعادة تقييم اليوم" : behindP.name + " needs reassessment today" },
    { color: "var(--color-accent)", text: isAr ? pendingCount + " فواتير بانتظار السداد" : pendingCount + " invoices awaiting payment" },
  ].filter(Boolean) as Array<{ color: string; text: string }>;

  const hudPanel = "pointer-events:auto;overflow-y:auto;padding:var(--space-4);border-radius:var(--radius-lg);background:color-mix(in srgb, var(--color-surface) 55%, transparent);backdrop-filter:blur(18px);border:1px solid var(--color-divider);box-shadow:var(--shadow-sm);animation:ptHudIn .75s cubic-bezier(.3,1.2,.5,1) both";
  const hudKicker = "display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-accent);margin-bottom:10px";
  const kickerDot = <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);box-shadow:0 0 7px var(--color-accent)")} />;

  return (
    <div
      data-screen-label="jarvis-os"
      style={sx(`position:fixed;inset:0;z-index:100;display:grid;place-items:center;overflow:hidden;pointer-events:${osPhase === "out" ? "none" : "auto"};background:radial-gradient(900px 620px at 50% 44%, color-mix(in srgb, var(--color-section) 26%, transparent), transparent 72%), color-mix(in srgb, var(--color-bg) 28%, black);animation:${osPhase === "out" ? "ptBootOut .9s cubic-bezier(.4,0,.2,1) forwards" : "none"}`)}
    >
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={sx(`position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 7px color-mix(in srgb, var(--color-accent) 45%, transparent));opacity:${osPhase === "core" ? 0.9 : 0.22};transition:opacity 1.2s ease`)}>
        <g fill="none" stroke="var(--color-accent-600)" strokeWidth="1.3" opacity="0.75">
          {TRACES.map((tr, i) => (
            <path key={i} d={tr.d} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: `ptTrace 1.7s cubic-bezier(.4,0,.2,1) ${tr.delay} forwards` }} />
          ))}
        </g>
        <g fill="var(--color-accent)">
          {NODES.map((n, i) => (
            <circle key={i} cx={n.cx} cy={n.cy} r={3} style={{ opacity: 0, animation: `ptFadeIn .5s ${n.d} forwards` }} />
          ))}
        </g>
      </svg>

      {PARTICLES.map((p, i) => (
        <span key={i} style={sx(`position:absolute;left:${p.left};top:${p.top};width:${p.size};height:${p.size};border-radius:50%;background:var(--color-accent-400);opacity:0;animation:ptFloat ${p.dur} linear ${p.delay} infinite`)} />
      ))}

      <div style={sx(`position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;gap:0;max-width:640px;padding:24px;transform:translateY(${osPhase === "core" ? "0px" : "-36vh"}) scale(${osPhase === "core" ? 1 : 0.55});transition:transform 1.15s cubic-bezier(.3,1.12,.5,1)`)}>
        <div style={sx("position:relative;width:128px;height:128px;animation:ptCore 1.8s cubic-bezier(.22,.8,.36,1) 0.5s both")}>
          <span style={sx("position:absolute;inset:-16px;border-radius:50%;border:1px solid var(--color-accent-800);border-top-color:var(--color-accent);animation:ptSpin 7s linear infinite;opacity:0.8")} />
          <span style={sx("position:absolute;inset:0;border-radius:28px;display:grid;place-items:center;border:1px solid var(--color-accent);background:color-mix(in srgb, var(--color-accent) 8%, transparent);backdrop-filter:blur(10px);color:var(--color-accent);animation:ptBreathe 3.2s ease-in-out infinite")}>{SPARKLE_LG}</span>
        </div>

        <div style={sx("margin-top:26px;animation:ptFadeSlide .8s cubic-bezier(.22,.8,.36,1) 1.5s both")}>
          <div dir="ltr" style={sx("font-family:var(--font-heading);font-size:24px;font-weight:500;letter-spacing:0.32em;padding-inline-start:0.32em")}>JARVIS</div>
          <div dir="ltr" style={sx("font-size:11px;opacity:0.5;margin-top:5px;letter-spacing:0.08em")}>MEDICAL AI OS · PHYSIOTRACK</div>
        </div>

        <div dir="ltr" style={sx(`display:flex;flex-direction:column;gap:7px;min-width:280px;opacity:${osPhase === "core" ? 1 : 0};max-height:${osPhase === "core" ? "300px" : "0px"};overflow:hidden;margin-top:${osPhase === "core" ? "26px" : "0px"};transition:opacity .6s, max-height .9s cubic-bezier(.22,.8,.36,1), margin-top .9s cubic-bezier(.22,.8,.36,1)`)}>
          {BOOT_LABELS.map((label, i) => (
            <div key={label} style={sx(`display:flex;align-items:center;gap:10px;font-size:11.5px;letter-spacing:0.05em;opacity:0;animation:ptFadeSlide .55s cubic-bezier(.22,.8,.36,1) ${(2.0 + i * 0.24).toFixed(2)}s forwards;text-align:start`)}>
              <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);box-shadow:0 0 7px var(--color-accent);flex-shrink:0")} />
              <span style={sx("flex:1;opacity:0.8")}>{label}</span>
              <span style={sx("color:var(--color-accent)")}>✓</span>
            </div>
          ))}
        </div>

        <div style={sx(`display:flex;align-items:center;justify-content:center;gap:3px;height:24px;margin-top:22px;opacity:${state.speakingNow && osPhase === "core" ? 1 : 0};transition:opacity .4s`)}>
          {state.waveHeights.map((h, i) => (
            <span key={i} style={sx(`width:3px;height:20px;border-radius:2px;background:var(--color-accent);box-shadow:0 0 6px color-mix(in srgb, var(--color-accent) 40%, transparent);transform:scaleY(${h});transition:transform .09s linear`)} />
          ))}
        </div>

        <div dir="auto" style={sx(`min-height:30px;margin-top:14px;font-size:15.5px;line-height:1.6;color:color-mix(in srgb, var(--color-text) 92%, transparent);opacity:${state.bootCaptionOn ? 1 : 0};transition:opacity .35s ease`)}>{state.bootCaption}</div>
      </div>

      {osHud && (
        <div style={sx("position:absolute;inset:150px 4vw 130px;display:grid;grid-template-columns:1.15fr 1fr 1fr;grid-template-rows:minmax(0,1fr) minmax(0,1fr);gap:14px;pointer-events:none")}>
          {hud(1) && (
            <div style={sx(`grid-column:1;grid-row:1 / span 2;${hudPanel}`)}>
              <div style={sx(hudKicker)}>{kickerDot}{t.hudApptsTitle}</div>
              {byTime.map((p) => (
                <S key={p.id} sx="display:flex;align-items:center;gap:12px;padding:10px 2px;border-top:1px solid var(--color-divider)">
                  <span dir="ltr" style={sx("font-family:var(--font-heading);font-size:14px;color:var(--color-accent);font-variant-numeric:tabular-nums;white-space:nowrap;min-width:74px;text-align:start")}>{apptTime(p)}</span>
                  <span style={sx("flex:1;min-width:0")}>
                    <span style={sx("display:block;font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{p.name}</span>
                    <span dir="ltr" style={sx("display:block;font-size:11px;opacity:0.55;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{p.diag}</span>
                  </span>
                </S>
              ))}
            </div>
          )}
          {hud(2) && (
            <div style={sx(`grid-column:2;grid-row:1;${hudPanel}`)}>
              <div style={sx(hudKicker)}>{kickerDot}{t.hudQueueTitle}</div>
              {byTime.slice(0, 3).map((p, i) => (
                <S key={p.id} sx="display:flex;align-items:center;gap:10px;padding:9px 2px;border-top:1px solid var(--color-divider)">
                  <span style={sx("width:32px;height:32px;border-radius:10px;flex-shrink:0;display:grid;place-items:center;font-weight:600;font-size:12px;background:var(--color-accent-900);color:var(--color-accent-200)")}>{initials(p.name)}</span>
                  <span style={sx("flex:1;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{p.name}</span>
                  <span className={`tag ${i === 0 ? "tag-accent" : "tag-neutral"}`} style={{ whiteSpace: "nowrap" }}>{i === 0 ? t.queueNow : t.queueWaiting}</span>
                </S>
              ))}
            </div>
          )}
          {hud(3) && (
            <div style={sx(`grid-column:3;grid-row:1;${hudPanel}`)}>
              <div style={sx(hudKicker)}>{kickerDot}{t.hudUpcomingTitle}</div>
              {byTime.slice(2).map((p) => (
                <S key={p.id} sx="display:flex;align-items:center;gap:10px;padding:9px 2px;border-top:1px solid var(--color-divider);font-size:12.5px">
                  <span dir="ltr" style={sx("color:var(--color-accent);font-variant-numeric:tabular-nums;white-space:nowrap")}>{apptTime(p)}</span>
                  <span style={sx("flex:1;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{p.name}</span>
                  <span style={sx("font-size:10.5px;opacity:0.5;white-space:nowrap")}>{apptDay(p)}</span>
                </S>
              ))}
            </div>
          )}
          {hud(4) && (
            <div style={sx(`grid-column:2;grid-row:2;${hudPanel}`)}>
              <div style={sx(hudKicker)}>{kickerDot}{t.cdssTitle}</div>
              {allInsights.slice(0, 4).map((hi) => (
                <S key={hi.key} sx="display:flex;gap:9px;padding:8px 2px;border-top:1px solid var(--color-divider)">
                  <span style={sx(`width:5px;height:5px;border-radius:50%;background:${SEV_META[hi.sev].color};box-shadow:0 0 6px ${SEV_META[hi.sev].color};flex-shrink:0;margin-top:5px`)} />
                  <span style={sx("flex:1;min-width:0")}>
                    <span style={sx("display:block;font-size:10.5px;opacity:0.55")}>{hi.patientName}</span>
                    <span style={sx("display:block;font-size:12px;font-weight:500;line-height:1.45;margin-top:1px")}>{hi.title}</span>
                  </span>
                </S>
              ))}
            </div>
          )}
          {hud(5) && (
            <div style={sx(`grid-column:3;grid-row:2;${hudPanel}`)}>
              <div style={sx(hudKicker)}>{kickerDot}{t.hudNotifsTitle}</div>
              {hudNotifs.map((n, i) => (
                <div key={i} style={sx(`padding:8px 10px;margin-top:7px;border-radius:var(--radius-md);background:color-mix(in srgb, ${n.color} 7%, transparent);border-inline-start:2px solid ${n.color};font-size:11.5px;line-height:1.55`)}>{n.text}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {osChat && (
        <div style={sx("position:absolute;bottom:24px;left:50%;transform:translateX(-50%);width:min(720px,92vw);display:flex;flex-direction:column;gap:10px;animation:ptRise .8s cubic-bezier(.3,1.2,.5,1) both")}>
          <div ref={jarvis.msgsRef} style={sx("max-height:22vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:2px")}>
            {state.jarvisMsgs.slice(-5).map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div key={i} dir="auto" style={sx(`align-self:${isUser ? "flex-end" : "flex-start"};max-width:78%;padding:9px 13px;border-radius:12px;background:${isUser ? "color-mix(in srgb, var(--color-accent) 13%, transparent)" : "color-mix(in srgb, var(--color-surface) 62%, transparent)"};backdrop-filter:blur(14px);border:1px solid ${isUser ? "color-mix(in srgb, var(--color-accent) 35%, transparent)" : "var(--color-divider)"};font-size:13px;line-height:1.65;white-space:pre-wrap;animation:ptFadeSlide .35s cubic-bezier(.22,.8,.36,1) both`)}>{m.text}</div>
              );
            })}
            {state.jarvisBusy && (
              <div style={sx("align-self:flex-start;display:flex;gap:4px;padding:12px 14px;border-radius:12px;background:color-mix(in srgb, var(--color-surface) 60%, transparent);border:1px solid var(--color-divider)")}>
                <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);animation:ptBounce 1.1s ease-in-out infinite")} />
                <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);animation:ptBounce 1.1s ease-in-out 0.15s infinite")} />
                <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);animation:ptBounce 1.1s ease-in-out 0.3s infinite")} />
              </div>
            )}
          </div>
          <div style={sx("display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-lg);background:color-mix(in srgb, var(--color-surface) 62%, transparent);backdrop-filter:blur(22px);border:1px solid color-mix(in srgb, var(--color-text) 13%, transparent);box-shadow:var(--shadow-md)")}>
            <span style={sx("display:flex;align-items:center;gap:3px;height:20px;flex-shrink:0")}>
              {state.waveHeights.slice(0, 5).map((h, i) => (
                <span key={i} style={sx(`width:2.5px;height:16px;border-radius:2px;background:var(--color-accent);transform:scaleY(${h});transition:transform .09s linear`)} />
              ))}
            </span>
            <span style={sx("font-size:10.5px;color:var(--color-accent-300);white-space:nowrap;flex-shrink:0")}>{osStatusLabel}</span>
            <input
              className="input"
              value={state.jarvisInput}
              onInput={(e) => jarvis.setInput((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => { if (e.key === "Enter") jarvis.send(); }}
              placeholder={t.jarvisPlaceholder}
              style={sx("flex:1;background:transparent;border-color:transparent;min-width:0")}
            />
            {jarvis.srOk() && (
              <button type="button" className="btn btn-secondary btn-icon" onClick={jarvis.mic} title="voice input" style={sx(`color:${state.listening ? "var(--color-accent)" : "color-mix(in srgb, var(--color-text) 55%, transparent)"};border-color:${state.listening ? "var(--color-accent)" : "var(--color-divider)"};flex-shrink:0`)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2.5" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5" /></svg>
              </button>
            )}
            <button type="button" className="btn btn-primary btn-icon" onClick={() => jarvis.send()} aria-label="send" style={{ flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={sx(`transform:${isAr ? "scaleX(-1)" : "none"}`)}><path d="M3.5 11.5L20.5 3.5 14 20.5l-2.5-6.5z" /><path d="M20.5 3.5L11.5 14" /></svg>
            </button>
          </div>
        </div>
      )}

      <div style={sx("position:absolute;top:18px;inset-inline-end:20px;display:flex;gap:8px;animation:ptFadeIn 1s 1.4s both")}>
        <button type="button" className="btn btn-secondary btn-icon" onClick={jarvis.toggleBootVoice} title="voice" style={sx(`color:${state.bootVoiceOn ? "var(--color-accent)" : "color-mix(in srgb, var(--color-text) 45%, transparent)"}`)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6.5 9H3v6h3.5L11 19zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9.5 9.5 0 0 1 0 13" /></svg>
        </button>
        <button type="button" className="btn btn-secondary" onClick={jarvis.minimizeOS} style={{ fontSize: 12 }}>{osPhase === "core" ? t.bootSkip : t.osEnter}</button>
      </div>
    </div>
  );
}
