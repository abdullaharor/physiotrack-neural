import { useAppCtx } from "../AppContext";
import { sx } from "../../lib/sx";
import { TEAM } from "../../data/registries";

/** Team — clinic staff table. Faithful to v3 lines 281–297. */
export function Team() {
  const { state, t } = useAppCtx();
  const isAr = state.lang === "ar";
  return (
    <div style={sx("padding:var(--space-4);border-radius:var(--radius-md);background:var(--color-surface);border:1px solid var(--color-divider);animation:ptRise .5s both")}>
      <table className="table">
        <thead>
          <tr><th>{t.colName}</th><th>{t.colRole}</th><th>{t.colStatus}</th></tr>
        </thead>
        <tbody>
          {TEAM.map((m, i) => (
            <tr key={m.en} style={sx(`animation:ptRise .5s both;animation-delay:${i * 60}ms`)}>
              <td style={{ fontWeight: 600 }}>{isAr ? m.ar : m.en}</td>
              <td className="text-muted">{isAr ? m.roleAr : m.roleEn}</td>
              <td><span className="tag tag-accent">{t.active}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
