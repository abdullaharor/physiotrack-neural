import { useAppCtx } from "../AppContext";
import { sx } from "../../lib/sx";
import { CLINICAL_DATA } from "../../data/registries";

/** Assessment report modal — animated ROM ring, per-joint breakdown, MMT and
 *  summary. Faithful to v3 lines 568–608. */
export function ReportModal() {
  const { state, t, actions } = useAppCtx();
  const rec = state.reportRec;
  if (!rec) return null;
  const data = CLINICAL_DATA[rec.dxKey];
  const rt = state.ringT;
  const ringPct = Math.round(rec.romPct * rt * 10) / 10;
  const ringValue = Math.round(rec.romPct * rt);
  const summary = rec.romPct >= 80 ? t.reportSummaryGood : rec.romPct >= 50 ? t.reportSummaryFair : t.reportSummaryLow;

  return (
    <>
      <div style={sx("font-family:var(--font-heading);font-size:20px;animation:ptFadeSlide .4s both")}>{t.reportTitle}</div>
      <div style={sx("display:flex;align-items:center;gap:var(--space-6);padding:var(--space-4);border-radius:var(--radius-md);background:color-mix(in srgb, var(--color-bg) 55%, transparent);border:1px solid var(--color-divider);animation:ptFadeSlide .45s both")}>
        <div style={sx(`width:116px;height:116px;flex-shrink:0;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--color-accent) ${ringPct}%, var(--color-neutral-800) 0);box-shadow:0 0 24px color-mix(in srgb, var(--color-accent) 18%, transparent)`)}>
          <div style={sx("width:90px;height:90px;border-radius:50%;background:var(--color-surface);display:grid;place-items:center;text-align:center")}>
            <div>
              <div style={sx("font-size:25px;font-weight:600;font-variant-numeric:tabular-nums")}>{ringValue}%</div>
              <div style={sx("font-size:9px;letter-spacing:0.09em;text-transform:uppercase;opacity:0.5")}>{t.overallRom}</div>
            </div>
          </div>
        </div>
        <div style={sx("flex:1")}>
          <div style={sx("font-size:13px;opacity:0.75;line-height:1.6")}>{summary}</div>
          <div style={sx("display:flex;gap:8px;margin-top:12px")}>
            <span className="tag tag-accent" dir="ltr">MMT {rec.mmtAvg}/5</span>
            <span className="tag tag-neutral">{rec.date}</span>
          </div>
        </div>
      </div>

      {data.joints.map((j, ji) => (
        <div key={ji} style={sx(`padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);background:color-mix(in srgb, var(--color-bg) 45%, transparent);border:1px solid var(--color-divider);animation:ptFadeSlide .5s both;animation-delay:${ji * 70}ms`)}>
          <div dir="ltr" style={sx("font-family:var(--font-heading);font-size:14px;margin-bottom:4px")}>{j.name}</div>
          {j.motions.map((m, mi) => {
            const v = rec.rom[ji + "-" + mi] || 0;
            const pct = m.normal > 0 ? Math.min(Math.round((v / m.normal) * 100), 100) : 100;
            return (
              <div key={mi} style={sx("display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--color-divider);font-size:13px")}>
                <span dir="ltr" style={sx("opacity:0.7")}>{m.name}</span>
                <span style={sx("font-weight:600;display:flex;align-items:center;gap:8px")}>
                  <span dir="ltr" style={sx("unicode-bidi:isolate;white-space:nowrap;font-variant-numeric:tabular-nums")}>{v}° / {m.normal}°</span>
                  <span className="tag tag-accent" dir="ltr">{pct}%</span>
                </span>
              </div>
            );
          })}
        </div>
      ))}

      <div style={sx("padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);background:color-mix(in srgb, var(--color-bg) 45%, transparent);border:1px solid var(--color-divider);animation:ptFadeSlide .55s both")}>
        <div style={sx("font-family:var(--font-heading);font-size:14px;margin-bottom:4px")}>{t.mmtSection}</div>
        {data.muscles.map((name, i) => (
          <div key={i} style={sx("display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--color-divider);font-size:13px")}>
            <span dir="ltr" style={sx("opacity:0.7")}>{name}</span>
            <span className="tag tag-outline" dir="ltr">{rec.mmt[i]}/5</span>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={actions.closeModal}>{t.doneButton}</button>
    </>
  );
}
