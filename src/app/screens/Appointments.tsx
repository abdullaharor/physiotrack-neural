import { useAppCtx } from "../AppContext";
import { sx } from "../../lib/sx";
import { mkRow } from "../rows";

/** Appointments — today's schedule table. Faithful to v3 lines 242–260. */
export function Appointments() {
  const { state, t, actions } = useAppCtx();
  const isAr = state.lang === "ar";
  const rows = state.patients.map((p, i) => mkRow(p, i, t, isAr));
  return (
    <div style={sx("padding:var(--space-4);border-radius:var(--radius-md);background:var(--color-surface);border:1px solid var(--color-divider);animation:ptRise .5s both")}>
      <table className="table">
        <thead>
          <tr><th>{t.colPatient}</th><th>{t.colDiagnosis}</th><th>{t.colDay}</th><th>{t.colTime}</th><th>{t.colStatus}</th></tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} style={sx(`animation:ptRise .5s both;animation-delay:${p.delay};cursor:pointer`)} onClick={() => actions.openProfile(p.id)}>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td dir="ltr" className="text-muted">{p.diag}</td>
              <td>{p.apptDay}</td>
              <td>{p.apptTime}</td>
              <td><span className="tag tag-accent">{t.confirmed}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
