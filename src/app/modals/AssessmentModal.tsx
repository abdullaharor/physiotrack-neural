import { useAppCtx } from "../AppContext";
import { Box } from "../../lib/Box";
import { sx } from "../../lib/sx";
import { CLINICAL_DATA, DX_META } from "../../data/registries";

/** ROM + MMT assessment modal. Faithful to v3 lines 524–565. */
export function AssessmentModal() {
  const { state, t, actions } = useAppCtx();
  const a = state.assess;
  if (!a) return null;
  const data = CLINICAL_DATA[a.dxKey];

  let doneCount = 0, totalCount = 0;
  const joints = data.joints.map((j, ji) => ({
    name: j.name,
    motions: j.motions.map((m, mi) => {
      const id = ji + "-" + mi;
      const val = a.rom[id] || 0;
      totalCount++; if (val > 0) doneCount++;
      const max = Math.max(Math.round(m.normal * 1.15), m.normal + 10, 5);
      return { id, name: m.name, normLabel: "Normal " + m.normal + "°", max, value: val };
    }),
  }));
  const progressPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const title = DX_META[a.dxKey][state.lang].label;

  return (
    <>
      <div style={sx("display:flex;align-items:center;gap:12px;animation:ptFadeSlide .4s both")}>
        <div style={sx("font-family:var(--font-heading);font-size:20px;flex:1")}>{title}</div>
        <span style={sx("font-size:11.5px;opacity:0.55;font-variant-numeric:tabular-nums")}>{progressPct}%</span>
      </div>
      <div style={sx("height:3px;border-radius:3px;background:var(--color-neutral-800);overflow:hidden;flex-shrink:0")}>
        <div style={sx(`height:100%;background:var(--color-accent);width:${progressPct}%;transition:width .5s cubic-bezier(.22,.8,.36,1)`)} />
      </div>

      {joints.map((j, ji) => (
        <div key={ji}>
          <div dir="ltr" style={sx("font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;opacity:0.5;margin-top:var(--space-2)")}>{j.name}</div>
          {j.motions.map((m) => (
            <div key={m.id} style={sx("padding:8px 0 10px;border-top:1px solid var(--color-divider)")}>
              <div style={sx("display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px")}>
                <span dir="ltr" style={sx("font-size:13.5px;font-weight:500")}>{m.name}</span>
                <span dir="ltr" style={sx("font-size:11px;opacity:0.5")}>{m.normLabel}</span>
              </div>
              <div dir="ltr" style={sx("display:flex;align-items:center;gap:14px")}>
                <input type="range" min={0} max={m.max} value={m.value} onChange={(e) => actions.setRom(m.id, e.target.value)} style={{ flex: 1 }} />
                <span style={sx("min-width:48px;text-align:end;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums")}>{m.value}°</span>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={sx("font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;opacity:0.5;margin-top:var(--space-3)")}>{t.mmtSection}</div>
      {data.muscles.map((name, i) => (
        <div key={i} style={sx("padding:8px 0 10px;border-top:1px solid var(--color-divider)")}>
          <div style={sx("display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px")}>
            <span dir="ltr" style={sx("font-size:13.5px;font-weight:500")}>{name}</span>
            <span dir="ltr" style={sx("font-size:11.5px;color:var(--color-accent-300);font-variant-numeric:tabular-nums")}>{a.mmt[i]}/5</span>
          </div>
          <div dir="ltr" style={sx("display:flex;gap:6px")}>
            {[0, 1, 2, 3, 4, 5].map((v) => {
              const sel = a.mmt[i] === v;
              return (
                <Box
                  key={v}
                  onClick={() => actions.setMmt(i, v)}
                  sx={`flex:1;padding:7px 0;border-radius:var(--radius-sm);border:1px solid ${sel ? "var(--color-accent)" : "var(--color-divider)"};background:${sel ? "var(--color-accent)" : "transparent"};color:${sel ? "var(--color-accent-900)" : "var(--color-text)"};text-align:center;font-weight:600;font-size:13px;cursor:pointer;transition:all .25s cubic-bezier(.34,1.5,.64,1)`}
                  hover="border-color:var(--color-accent)"
                  active="transform:scale(.88)"
                >{v}</Box>
              );
            })}
          </div>
        </div>
      ))}

      <div style={sx("display:flex;gap:var(--space-2);justify-content:flex-end;margin-top:var(--space-2)")}>
        <button type="button" className="btn btn-secondary" onClick={actions.closeModal}>{t.cancel}</button>
        <button type="button" className="btn btn-primary" onClick={actions.finishAssessment}>{t.generateReport}</button>
      </div>
    </>
  );
}
