import { useAppCtx } from "../AppContext";
import { Box, S } from "../../lib/Box";
import { Icon, ICONS } from "../../lib/icons";
import { sx } from "../../lib/sx";
import { initials } from "../../data/seed";
import { DX_META } from "../../data/registries";
import { InsightCard } from "./InsightCard";

/** Patient profile modal — summary, assessment + anatomy actions, CDSS
 *  insights, and assessment history. Faithful to v3 lines 385–479. */
export function ProfileModal() {
  const { state, t, actions, activeInsights } = useAppCtx();
  const lang = state.lang;
  const isAr = lang === "ar";
  const p = state.patients.find((x) => x.id === state.profileId);
  if (!p) return null;

  const ageGender = (p.age ? p.age + (isAr ? " سنة · " : " yrs · ") : "") + (p.gender === "female" ? t.female : t.male);
  const pct = Math.round((p.done / p.total) * 100);
  const insights = activeInsights(p);

  const goAnatomyFromProfile = () => { actions.closeModal(); setTimeout(() => actions.go("anatomy"), 240); };

  return (
    <>
      <S sx="display:flex;align-items:center;gap:12px;animation:ptFadeSlide .4s both">
        <button type="button" className="btn btn-secondary btn-icon" onClick={actions.closeModal} aria-label="close">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <div style={sx("font-family:var(--font-heading);font-size:20px;flex:1")}>{p.name}</div>
      </S>

      <S sx="display:flex;align-items:center;gap:16px;padding:var(--space-4);border-radius:var(--radius-md);background:color-mix(in srgb, var(--color-bg) 60%, transparent);border:1px solid var(--color-divider);animation:ptFadeSlide .45s both">
        <div style={sx("width:58px;height:58px;border-radius:16px;flex-shrink:0;display:grid;place-items:center;font-weight:600;font-size:19px;background:var(--color-accent-900);color:var(--color-accent-200);box-shadow:inset 0 0 0 1px var(--color-accent-700), 0 0 18px color-mix(in srgb, var(--color-accent) 22%, transparent)")}>{initials(p.name)}</div>
        <div style={sx("min-width:0")}>
          <div style={sx("font-size:17px;font-weight:600")}>{p.name}</div>
          <div style={sx("font-size:12.5px;opacity:0.6;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{ageGender} · <span dir="ltr" style={sx("unicode-bidi:isolate;white-space:nowrap;display:inline-block;max-width:230px;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom")}>{p.diag}</span></div>
          <S sx="display:flex;align-items:center;gap:10px;margin-top:8px">
            <div style={sx("flex:1;width:150px;height:4px;border-radius:4px;background:var(--color-neutral-800);overflow:hidden")}>
              <div style={sx(`height:100%;background:linear-gradient(90deg, var(--color-accent-600), var(--color-accent));width:${pct}%;animation:ptGrow .9s cubic-bezier(.22,.8,.36,1) both`)} />
            </div>
            <span style={sx("font-size:11px;opacity:0.6;white-space:nowrap")}>{p.done}/{p.total} {t.sessions}</span>
          </S>
        </div>
      </S>

      <div style={sx("display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)")}>
        <Box
          onClick={actions.startAssessment}
          sx="padding:var(--space-4);border-radius:var(--radius-md);border:1px solid var(--color-accent);color:var(--color-accent);cursor:pointer;animation:ptFadeSlide .5s both;transition:background .25s,transform .3s cubic-bezier(.34,1.6,.64,1)"
          hover="background:color-mix(in srgb, var(--color-accent) 10%, transparent)"
          active="transform:scale(.97)"
        >
          <Icon html={ICONS.assess} sx="display:flex;width:20px;height:20px" />
          <div style={sx("font-weight:600;font-size:14px;margin-top:10px")}>{t.newAssessment}</div>
          <div style={sx("font-size:11.5px;opacity:0.65;margin-top:2px")}>{t.newAssessmentSub}</div>
        </Box>
        <Box
          onClick={goAnatomyFromProfile}
          sx="position:relative;padding:var(--space-4);border-radius:var(--radius-md);border:1px solid var(--color-divider);cursor:pointer;animation:ptFadeSlide .55s both;transition:background .25s,transform .3s cubic-bezier(.34,1.6,.64,1)"
          hover="background:color-mix(in srgb, var(--color-text) 5%, transparent)"
          active="transform:scale(.97)"
        >
          <Icon html={ICONS.anatomy} sx="display:flex;width:20px;height:20px;opacity:0.7" />
          <div style={sx("font-weight:600;font-size:14px;margin-top:10px;opacity:0.8")}>{t.anatomyTitle}</div>
          <div style={sx("font-size:11.5px;opacity:0.5;margin-top:2px")}>{t.anatomyTeaserShort}</div>
          <span className="tag tag-outline" style={{ position: "absolute", top: 12, insetInlineEnd: 12, fontSize: 9 }}>{t.soonTag}</span>
        </Box>
      </div>

      {insights.length > 0 && (
        <>
          <S sx="display:flex;align-items:center;gap:8px;margin-top:var(--space-2)">
            <span style={sx("font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;opacity:0.5;flex:1")}>{t.cdssTitle}</span>
            <span className="tag tag-outline" style={{ whiteSpace: "nowrap", fontSize: 9 }}>{t.cdssTag}</span>
          </S>
          {insights.map((ins, i) => (
            <InsightCard key={ins.key} ins={ins} delay={`${Math.min(i * 60, 300)}ms`} />
          ))}
          <div style={sx("font-size:10px;opacity:0.4;line-height:1.5")}>{t.cdssDisclaimer}</div>
        </>
      )}

      {p.history.length > 0 && (
        <>
          <div style={sx("font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;opacity:0.5;margin-top:var(--space-2)")}>{t.historyTitle}</div>
          {p.history.map((h, i) => (
            <Box
              key={i}
              onClick={() => actions.viewReport(h)}
              sx="display:flex;align-items:center;gap:12px;padding:12px var(--space-3);border-radius:var(--radius-md);background:color-mix(in srgb, var(--color-bg) 50%, transparent);border:1px solid var(--color-divider);cursor:pointer;animation:ptFadeSlide .5s both;transition:background .25s"
              hover="background:color-mix(in srgb, var(--color-text) 6%, transparent)"
            >
              <div style={sx("flex:1")}>
                <div style={sx("font-weight:600;font-size:13.5px")}>{DX_META[h.dxKey][lang].label}</div>
                <div style={sx("font-size:11.5px;opacity:0.55;margin-top:2px")}>{h.date} · ROM {h.romPct}% · MMT {h.mmtAvg}/5</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={sx(`opacity:0.4;transform:${isAr ? "scaleX(-1)" : "none"}`)}><path d="M9 18l6-6-6-6" /></svg>
            </Box>
          ))}
        </>
      )}
    </>
  );
}
