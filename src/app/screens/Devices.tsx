import { useAppCtx } from "../AppContext";
import { Box, S } from "../../lib/Box";
import { Icon, ICONS } from "../../lib/icons";
import { sx } from "../../lib/sx";
import { getDeviceProvider } from "../../integrations/devices/provider";

/** Devices — plugin hub rendered from the MedicalDeviceProvider (paired
 *  devices + supported catalog by category). Faithful to v3 lines 328–373. */
export function Devices() {
  const { state, t } = useAppCtx();
  const isAr = state.lang === "ar";
  const provider = getDeviceProvider();
  const paired = provider.getPairedDevices();
  const categories = provider.getCategories();
  const catalog = provider.getCatalog();

  return (
    <>
      <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:var(--space-4);animation:ptRise .45s both")}>
        <div style={sx("font-size:13px;opacity:0.65;max-width:60ch;line-height:1.6")}>{t.devicesLead}</div>
        <span className="tag tag-outline" style={{ whiteSpace: "nowrap" }}>{t.pluginArch}</span>
      </div>

      <div style={sx("font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;opacity:0.5;margin:var(--space-4) 0 var(--space-3)")}>{t.pairedTitle}</div>
      <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--space-4)")}>
        {paired.map((d, i) => (
          <Box
            key={d.name}
            sx={`display:flex;align-items:center;gap:14px;padding:var(--space-4);border-radius:var(--radius-md);background:linear-gradient(160deg, color-mix(in srgb, var(--color-surface) 90%, var(--color-section-glow)), var(--color-surface) 75%);border:1px solid var(--color-divider);animation:ptRise .55s both;animation-delay:${i * 70}ms;transition:transform .35s cubic-bezier(.3,1.3,.5,1),box-shadow .35s`}
            hover="transform:translateY(-3px);box-shadow:var(--shadow-md)"
          >
            <Icon html={ICONS[d.icon]} sx="position:relative;width:42px;height:42px;flex-shrink:0;display:grid;place-items:center;border-radius:12px;border:1px solid var(--color-accent-800);color:var(--color-accent);background:color-mix(in srgb, var(--color-accent) 8%, transparent)" />
            <span style={sx("flex:1;min-width:0")}>
              <span dir="ltr" style={sx("display:block;font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{d.name}</span>
              <span style={sx("display:block;font-size:11.5px;opacity:0.55;margin-top:2px")}>{isAr ? d.metaAr : d.metaEn}</span>
            </span>
            <span style={sx("display:flex;align-items:center;gap:6px;font-size:11px;color:var(--color-accent-300);white-space:nowrap")}>
              <span style={sx("position:relative;width:7px;height:7px")}>
                <span style={sx("position:absolute;inset:0;border-radius:50%;background:var(--color-accent)")} />
                <span style={sx("position:absolute;inset:0;border-radius:50%;background:var(--color-accent);animation:ptPulseRing 2.2s ease-out infinite")} />
              </span>
              {t.statusConnected}
            </span>
          </Box>
        ))}
      </div>

      <div style={sx("font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;opacity:0.5;margin:var(--space-6) 0 var(--space-3)")}>{t.catalogTitle}</div>
      <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--space-4)")}>
        {categories.map((c, i) => (
          <div key={c.id} style={sx(`padding:var(--space-4);border-radius:var(--radius-md);background:var(--color-surface);border:1px solid var(--color-divider);animation:ptRise .55s both;animation-delay:${120 + i * 70}ms`)}>
            <div style={sx("font-family:var(--font-heading);font-size:15px;margin-bottom:var(--space-2)")}>{isAr ? c.ar : c.en}</div>
            <div style={sx("display:flex;flex-direction:column")}>
              {catalog.filter((d) => d.cat === c.id).map((d) => (
                <S key={d.en} sx="display:flex;align-items:center;gap:10px;padding:9px 2px;border-top:1px solid var(--color-divider);font-size:12.5px">
                  <span style={sx("flex:1;opacity:0.85")}>{isAr ? d.ar : d.en}</span>
                  <span dir="ltr" style={sx("font-size:10px;opacity:0.45;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap")}>{d.conn}</span>
                  <span className={`tag ${d.status === "ready" ? "tag-accent" : "tag-neutral"}`} style={{ whiteSpace: "nowrap" }}>{d.status === "ready" ? t.statusReady : t.statusPlanned}</span>
                </S>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div dir="ltr" style={sx("font-size:10.5px;opacity:0.4;margin-top:var(--space-4);text-align:center")}>DeviceRegistry v1 · declarative plugin manifests · adding a device = one registry entry, zero core changes</div>
    </>
  );
}
