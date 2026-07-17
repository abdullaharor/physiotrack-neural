import { useAppCtx } from "../AppContext";
import { Box } from "../../lib/Box";
import { sx } from "../../lib/sx";
import { SEV_META } from "../../cdss/engine";
import type { ActiveInsight } from "../useApp";

/** Expandable CDSS insight card (clinical reasoning, findings, suggested
 *  groups, confirm/dismiss actions, note). Faithful to v3 lines 423–462. */
export function InsightCard({ ins, delay }: { ins: ActiveInsight; delay: string }) {
  const { state, t, actions } = useAppCtx();
  const meta = SEV_META[ins.sev];
  const expanded = state.expandedInsight === ins.key;
  const statusLabel = ins.status === "accepted" ? t.stAccepted : ins.status === "done" ? t.stDone : "";
  const dim = ins.status === "done" ? 0.55 : 1;
  const tint = `color-mix(in srgb, ${meta.color} 13%, transparent)`;

  return (
    <div style={sx(`border-radius:var(--radius-md);border:1px solid var(--color-divider);border-inline-start:2px solid ${meta.color};background:color-mix(in srgb, var(--color-bg) 50%, transparent);overflow:hidden;opacity:${dim};animation:ptFadeSlide .5s both;animation-delay:${delay};transition:opacity .4s`)}>
      <Box
        onClick={() => actions.toggleInsight(ins.key)}
        sx="display:flex;align-items:center;gap:10px;padding:11px var(--space-3);cursor:pointer;transition:background .25s"
        hover="background:color-mix(in srgb, var(--color-text) 4%, transparent)"
      >
        <span style={sx(`font-size:9px;letter-spacing:0.07em;text-transform:uppercase;padding:3px 8px;border-radius:6px;background:${tint};color:${meta.color};white-space:nowrap;flex-shrink:0`)}>{t[meta.labelKey as keyof typeof t]}</span>
        <span style={sx("flex:1;font-size:12.5px;font-weight:600;line-height:1.45;min-width:0")}>{ins.title}</span>
        {statusLabel && <span className="tag tag-neutral" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>{statusLabel}</span>}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={sx(`opacity:0.45;flex-shrink:0;transition:transform .35s cubic-bezier(.3,1.3,.5,1);transform:${expanded ? "rotate(180deg)" : "none"}`)}><path d="M6 9l6 6 6-6" /></svg>
      </Box>
      <div style={sx(`display:grid;grid-template-rows:${expanded ? "1fr" : "0fr"};transition:grid-template-rows .5s cubic-bezier(.22,.8,.36,1)`)}>
        <div style={sx("min-height:0;overflow:hidden")}>
          <div style={sx("padding:2px var(--space-3) var(--space-3)")}>
            <div style={sx("font-size:9.5px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.45;margin-bottom:4px")}>{t.cdssWhy}</div>
            <div style={sx("font-size:12.5px;line-height:1.65;opacity:0.85")}>{ins.why}</div>
            <div style={sx("font-size:9.5px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.45;margin:var(--space-3) 0 4px")}>{t.cdssFindings}</div>
            {(ins.findings || []).map((f, i) => (
              <div key={i} style={sx("display:flex;align-items:center;gap:8px;font-size:12px;opacity:0.75;padding:2px 0")}>
                <span style={sx(`width:4px;height:4px;border-radius:50%;background:${meta.color};flex-shrink:0`)} />
                <span dir="auto">{f}</span>
              </div>
            ))}
            {(ins.groups || []).map((g, gi) => (
              <div key={gi}>
                <div style={sx("font-size:9.5px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.45;margin:var(--space-3) 0 6px")}>{t[g.key as keyof typeof t]}</div>
                <div style={sx("display:flex;flex-wrap:wrap;gap:5px")}>
                  {g.items.map((it, ii) => (
                    <span key={ii} dir="ltr" style={sx("font-size:11px;padding:4px 10px;border-radius:999px;border:1px solid var(--color-divider);opacity:0.85;white-space:nowrap")}>{it}</span>
                  ))}
                </div>
              </div>
            ))}
            <div style={sx("display:flex;align-items:center;gap:8px;margin-top:var(--space-3);font-size:11px;opacity:0.6")}>
              <span>{t.cdssConfidence}:</span>
              <span style={sx(`color:${meta.color};font-weight:600`)}>{t[ins.confKey as keyof typeof t]}</span>
            </div>
            <div style={sx("display:flex;flex-wrap:wrap;gap:6px;margin-top:var(--space-3)")}>
              <button type="button" className="btn btn-primary" onClick={() => actions.setInsightStatus(ins.key, "accepted")} style={{ fontSize: 12 }}>{t.actAccept}</button>
              <button type="button" className="btn btn-secondary" onClick={() => actions.setInsightStatus(ins.key, "done")} style={{ fontSize: 12 }}>{t.actDone}</button>
              <button type="button" className="btn btn-secondary" onClick={() => actions.setInsightStatus(ins.key, "dismissed")} style={{ fontSize: 12 }}>{t.actDismiss}</button>
              <button type="button" className="btn btn-ghost" onClick={() => actions.hideRule(ins.ruleId)} style={{ fontSize: 12 }}>{t.actHide}</button>
            </div>
            <input
              className="input"
              value={ins.note}
              onInput={(e) => actions.setInsightNote(ins.key, (e.target as HTMLInputElement).value)}
              onClick={(e) => e.stopPropagation()}
              placeholder={t.notePlaceholder}
              style={sx("margin-top:var(--space-2);font-size:12px;min-height:32px;padding:5px 10px")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
