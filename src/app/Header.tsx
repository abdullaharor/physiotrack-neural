import { useAppCtx } from "./AppContext";
import { NAV_REGISTRY } from "../data/registries";
import { sx } from "../lib/sx";

/** Top header bar — animated view title/subtitle + online status. v3 99–108. */
export function Header() {
  const { state, t } = useAppCtx();
  const navDef = NAV_REGISTRY.find((n) => n.key === state.view) || NAV_REGISTRY[0];
  const title = t[navDef.labelKey as keyof typeof t];
  const sub = t[navDef.subKey as keyof typeof t];

  return (
    <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px var(--space-6);border-radius:var(--radius-lg);background:color-mix(in srgb, var(--color-surface) 66%, transparent);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border:1px solid var(--color-divider);box-shadow:var(--shadow-sm);flex-shrink:0")}>
      <div style={sx("min-width:0")}>
        <h1 key={`t-${state.view}`} style={sx("font-size:19px;margin:0;white-space:nowrap;animation:ptFadeSlide .45s cubic-bezier(.22,.8,.36,1) both")}>{title}</h1>
        <div key={`s-${state.view}`} style={sx("font-size:11.5px;opacity:0.5;margin-top:2px;white-space:nowrap;animation:ptFadeSlide .55s cubic-bezier(.22,.8,.36,1) both")}>{sub}</div>
      </div>
      <div style={sx("display:flex;align-items:center;gap:8px;font-size:12.5px;opacity:0.7;font-weight:500;white-space:nowrap")}>
        <span style={sx("width:7px;height:7px;border-radius:50%;background:var(--color-accent);box-shadow:0 0 8px var(--color-accent)")} />
        <span>{t.onlineStatus}</span>
      </div>
    </div>
  );
}
