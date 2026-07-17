import { useAppCtx } from "./AppContext";
import { sx } from "../lib/sx";
import { Dashboard } from "./screens/Dashboard";
import { Patients } from "./screens/Patients";
import { Appointments } from "./screens/Appointments";
import { Invoices } from "./screens/Invoices";
import { Team } from "./screens/Team";
import { Anatomy } from "./screens/Anatomy";
import { Devices } from "./screens/Devices";

const SHIMMER =
  "background:linear-gradient(100deg, var(--color-surface) 35%, color-mix(in srgb, var(--color-neutral-700) 26%, var(--color-surface)) 48%, var(--color-surface) 61%);background-size:200% 100%;animation:ptShimmer 1.25s linear infinite";

function Skeleton() {
  return (
    <>
      <div style={sx("display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4)")}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={sx(`height:96px;border-radius:var(--radius-md);${SHIMMER}`)} />
        ))}
      </div>
      <div style={sx("display:flex;flex-direction:column;gap:12px;margin-top:var(--space-6)")}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={sx(`height:58px;border-radius:var(--radius-md);${SHIMMER};animation-delay:${i * 90}ms`)} />
        ))}
      </div>
    </>
  );
}

/** Scrollable content area — skeleton while a view settles, then the screen. */
export function ScreenArea() {
  const { state } = useAppCtx();
  return (
    <div
      style={sx("flex:1;overflow-y:auto;overflow-x:hidden;padding:var(--space-2) var(--space-2) 40px;border-radius:var(--radius-lg)")}
      data-screen-label={state.view}
    >
      {state.viewLoading ? (
        <Skeleton />
      ) : (
        <>
          {state.view === "dashboard" && <Dashboard />}
          {state.view === "patients" && <Patients />}
          {state.view === "appointments" && <Appointments />}
          {state.view === "invoices" && <Invoices />}
          {state.view === "team" && <Team />}
          {state.view === "anatomy" && <Anatomy />}
          {state.view === "devices" && <Devices />}
        </>
      )}
    </div>
  );
}
