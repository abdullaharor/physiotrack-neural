import { useAppCtx } from "../AppContext";
import { sx } from "../../lib/sx";
import { mkRow } from "../rows";

/** Invoices — billing table (amount = sessions × 180 SAR). v3 lines 262–279. */
export function Invoices() {
  const { state, t } = useAppCtx();
  const isAr = state.lang === "ar";
  const rows = state.patients.map((p, i) => ({ ...mkRow(p, i, t, isAr), amount: (p.done * 180).toLocaleString("en-US") + " SAR" }));
  return (
    <div style={sx("padding:var(--space-4);border-radius:var(--radius-md);background:var(--color-surface);border:1px solid var(--color-divider);animation:ptRise .5s both")}>
      <table className="table">
        <thead>
          <tr><th>{t.colPatient}</th><th>{t.colSessions}</th><th>{t.colAmount}</th><th>{t.colStatus}</th></tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} style={sx(`animation:ptRise .5s both;animation-delay:${p.delay}`)}>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td>{p.done}</td>
              <td><span dir="ltr" style={sx("unicode-bidi:isolate;white-space:nowrap;font-variant-numeric:tabular-nums")}>{p.amount}</span></td>
              <td><span className={`tag ${p.invoiceTagClass}`}>{p.invoiceLabel}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
