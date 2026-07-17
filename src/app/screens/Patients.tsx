import { useAppCtx } from "../AppContext";
import { Box, S } from "../../lib/Box";
import { Icon, ICONS } from "../../lib/icons";
import { sx } from "../../lib/sx";
import { mkRow } from "../rows";

/** Patients — search + card grid of care plans. Faithful to v3 lines 203–240. */
export function Patients() {
  const { state, t, actions } = useAppCtx();
  const isAr = state.lang === "ar";
  const q = state.searchQ.trim().toLowerCase();
  const filtered = q ? state.patients.filter((p) => (p.name + " " + p.diag).toLowerCase().includes(q)) : state.patients;
  const cards = filtered.map((p, i) => mkRow(p, i, t, isAr));
  const noResults = q.length > 0 && filtered.length === 0;

  return (
    <>
      <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:var(--space-4);animation:ptRise .45s both")}>
        <div style={sx("position:relative;flex:1;max-width:340px")}>
          <Icon html={ICONS.search} sx="position:absolute;inset-inline-start:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;display:flex;opacity:0.45;pointer-events:none" />
          <Box
            as="input"
            className="input"
            value={state.searchQ}
            onChange={(e) => actions.setSearch((e.target as HTMLInputElement).value)}
            placeholder={t.searchPlaceholder}
            sx="padding-inline-start:36px;background:color-mix(in srgb, var(--color-surface) 80%, transparent);transition:box-shadow .3s,border-color .3s"
            focus="box-shadow:0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent)"
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={actions.openAddPatient}>{t.newPatient}</button>
      </div>

      <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:var(--space-4)")}>
        {cards.map((p) => (
          <Box
            key={p.id}
            onClick={() => actions.openProfile(p.id)}
            sx={`display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border-radius:var(--radius-md);background:var(--color-surface);border:1px solid var(--color-divider);cursor:pointer;animation:ptRise .55s cubic-bezier(.22,.8,.36,1) both;animation-delay:${p.delay};transition:transform .35s cubic-bezier(.3,1.3,.5,1),box-shadow .35s`}
            hover="transform:translateY(-4px);box-shadow:var(--shadow-md)"
            active="transform:scale(.985)"
          >
            <S sx="display:flex;align-items:center;gap:12px">
              <div style={sx("width:44px;height:44px;border-radius:13px;flex-shrink:0;display:grid;place-items:center;font-weight:600;font-size:15px;background:var(--color-accent-900);color:var(--color-accent-200);box-shadow:inset 0 0 0 1px var(--color-accent-800)")}>{p.initials}</div>
              <div style={sx("min-width:0")}>
                <div style={sx("font-family:var(--font-heading);font-weight:500;font-size:15.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{p.name}</div>
                <div dir="ltr" style={sx("font-size:11.5px;opacity:0.55;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{p.diag}</div>
              </div>
            </S>
            <div>
              <div style={sx("display:flex;justify-content:space-between;gap:8px;font-size:11px;opacity:0.6;margin-bottom:6px")}>
                <span style={{ whiteSpace: "nowrap" }}>{t.progress}</span>
                <span style={{ whiteSpace: "nowrap" }}>{p.sessionsLabel} · {p.pct}%</span>
              </div>
              <div style={sx("height:4px;border-radius:4px;background:var(--color-neutral-800);overflow:hidden")}>
                <div style={sx(`height:100%;border-radius:4px;background:linear-gradient(90deg, var(--color-accent-600), var(--color-accent));width:${p.pct}%;animation:ptGrow 1s cubic-bezier(.22,.8,.36,1) both`)} />
              </div>
            </div>
            <S sx="display:flex;justify-content:space-between;align-items:center">
              <span style={sx("font-size:11.5px;opacity:0.55;white-space:nowrap")}>{p.apptDay} · {p.apptTime}</span>
              <span className={`tag ${p.invoiceTagClass}`}>{p.invoiceLabel}</span>
            </S>
          </Box>
        ))}
      </div>

      {noResults && (
        <div style={sx("text-align:center;padding:60px 20px;opacity:0.5;font-size:13.5px;animation:ptFadeIn .4s both")}>{t.noResults}</div>
      )}
    </>
  );
}
