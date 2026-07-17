import { useAppCtx } from "./AppContext";
import { NAV_REGISTRY } from "../data/registries";
import { Box, S } from "../lib/Box";
import { Icon, ICONS } from "../lib/icons";
import { sx } from "../lib/sx";

/** Floating glass sidebar — brand, nav (with sliding indicator), language
 *  toggle and the therapist badge. Faithful to v3 lines 53–94. */
export function Sidebar() {
  const { state, t, actions } = useAppCtx();
  const isAr = state.lang === "ar";
  const navIndex = Math.max(0, NAV_REGISTRY.findIndex((n) => n.key === state.view));

  return (
    <aside style={sx("width:234px;flex-shrink:0;display:flex;flex-direction:column;padding:var(--space-6) var(--space-4) var(--space-4);border-radius:var(--radius-lg);background:color-mix(in srgb, var(--color-surface) 66%, transparent);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border:1px solid var(--color-divider);box-shadow:var(--shadow-sm)")}>
      <S sx="display:flex;align-items:center;gap:10px;padding:0 var(--space-2) var(--space-6)">
        <span style={sx("width:30px;height:30px;border-radius:9px;flex-shrink:0;display:grid;place-items:center;color:var(--color-accent);border:1px solid var(--color-accent);animation:ptBreathe 4.5s ease-in-out infinite")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2.5-6 4 12 2.5-6h5" /></svg>
        </span>
        <span>
          <span style={sx("display:block;font-family:var(--font-heading);font-weight:600;font-size:17px;letter-spacing:-0.02em")}>{t.appName}</span>
          <span style={sx("display:block;font-size:11px;opacity:0.55;margin-top:1px")}>{t.tagline}</span>
        </span>
      </S>

      <nav style={sx("position:relative;display:flex;flex-direction:column;gap:4px;flex:1")}>
        <div style={sx(`position:absolute;insetInlineStart:0;width:100%;height:42px;border-radius:var(--radius-md);background:color-mix(in srgb, var(--color-accent) 13%, transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 35%, transparent);pointer-events:none;transition:top .5s cubic-bezier(.3,1.35,.5,1);top:${navIndex * 46}px`)} />
        {NAV_REGISTRY.map((n) => {
          const activeC = state.view === n.key;
          return (
            <Box
              key={n.key}
              onClick={() => actions.go(n.key)}
              sx={`position:relative;display:flex;align-items:center;gap:12px;height:42px;padding:0 12px;border-radius:var(--radius-md);cursor:pointer;font-size:13.5px;font-weight:500;color:${activeC ? "var(--color-accent)" : "color-mix(in srgb, var(--color-text) 78%, transparent)"};transition:color .3s`}
              hover="background:color-mix(in srgb, var(--color-text) 5%, transparent)"
            >
              <Icon html={ICONS[n.icon]} sx="width:19px;height:19px;flex-shrink:0;display:flex;transition:transform .3s cubic-bezier(.34,1.6,.64,1)" />
              <span style={{ flex: 1 }}>{t[n.labelKey as keyof typeof t]}</span>
              {n.soon && (
                <span style={sx("font-size:9px;letter-spacing:0.08em;text-transform:uppercase;padding:2px 7px;border-radius:6px;border:1px solid var(--color-divider);opacity:0.65")}>{t.soonTag}</span>
              )}
            </Box>
          );
        })}
      </nav>

      <Box
        onClick={actions.toggleLang}
        sx="position:relative;display:flex;border:1px solid var(--color-divider);border-radius:var(--radius-md);cursor:pointer;margin-bottom:10px;overflow:hidden"
        title="Language"
      >
        <div style={sx(`position:absolute;top:0;bottom:0;width:50%;background:color-mix(in srgb, var(--color-accent) 14%, transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 40%, transparent);border-radius:var(--radius-md);transition:inset-inline-start .45s cubic-bezier(.3,1.35,.5,1);inset-inline-start:${isAr ? "0%" : "50%"}`)} />
        <span style={sx(`position:relative;flex:1;text-align:center;padding:8px 0;font-size:12px;font-weight:600;color:${isAr ? "var(--color-accent)" : "color-mix(in srgb, var(--color-text) 45%, transparent)"};transition:color .3s`)}>العربية</span>
        <span style={sx(`position:relative;flex:1;text-align:center;padding:8px 0;font-size:12px;font-weight:600;color:${isAr ? "color-mix(in srgb, var(--color-text) 45%, transparent)" : "var(--color-accent)"};transition:color .3s`)}>English</span>
      </Box>

      <S sx="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-md);background:color-mix(in srgb, var(--color-bg) 55%, transparent);border:1px solid var(--color-divider)">
        <span style={sx("position:relative;width:9px;height:9px;flex-shrink:0")}>
          <span style={sx("position:absolute;inset:0;border-radius:50%;background:var(--color-accent)")} />
          <span style={sx("position:absolute;inset:0;border-radius:50%;background:var(--color-accent);animation:ptPulseRing 2.6s ease-out infinite")} />
        </span>
        <span style={sx("min-width:0")}>
          <span style={sx("display:block;font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{t.doctorName}</span>
          <span style={sx("display:block;font-size:10.5px;opacity:0.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{t.doctorRole}</span>
        </span>
      </S>
    </aside>
  );
}
