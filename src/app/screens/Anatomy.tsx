import { useAppCtx } from "../AppContext";
import { sx } from "../../lib/sx";
import { getAnatomyProvider } from "../../integrations/anatomy/provider";

/** Anatomy — external 3D atlas slot (rendered from the AnatomyAtlasProvider
 *  manifest; "coming soon" in the mock). Faithful to v3 lines 299–326. */
export function Anatomy() {
  const { t } = useAppCtx();
  const manifest = getAnatomyProvider().getManifest();
  const features = manifest.featureKeys.map((k, i) => ({ label: t[k as keyof typeof t], delay: 150 + i * 80 + "ms" }));

  return (
    <div style={sx("display:grid;place-items:center;min-height:100%;padding:var(--space-6) 0")}>
      <div style={sx("position:relative;overflow:hidden;width:min(600px,100%);padding:var(--space-8);border-radius:var(--radius-lg);background:linear-gradient(165deg, color-mix(in srgb, var(--color-section) 55%, var(--color-surface)), var(--color-surface) 66%);border:1px solid var(--color-divider);box-shadow:var(--shadow-md);animation:ptRise .6s cubic-bezier(.22,.8,.36,1) both;text-align:center")}>
        <div style={sx("position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:340px;height:220px;border-radius:50%;background:radial-gradient(ellipse, color-mix(in srgb, var(--color-section-ghost) 45%, transparent), transparent 70%);pointer-events:none")} />
        <div style={sx("position:relative;width:74px;height:74px;margin:0 auto")}>
          <span style={sx("position:absolute;inset:0;border-radius:50%;border:1px solid var(--color-accent);opacity:0.5;animation:ptPulseRing 3s ease-out infinite")} />
          <span style={sx("position:absolute;inset:0;border-radius:50%;border:1px solid var(--color-accent);opacity:0.5;animation:ptPulseRing 3s ease-out 1.5s infinite")} />
          <span style={sx("position:absolute;inset:0;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb, var(--color-accent) 10%, transparent);border:1px solid var(--color-accent);color:var(--color-accent)")}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></svg>
          </span>
        </div>
        <div style={sx("margin-top:var(--space-6)")}><span className="tag tag-outline">{t.soonTag}</span></div>
        <h2 style={sx("font-size:26px;margin:var(--space-3) 0 var(--space-2)")}>{t.anatomyTitle}</h2>
        <p style={sx("font-size:13.5px;opacity:0.65;line-height:1.65;max-width:44ch;margin:0 auto var(--space-6)")}>{t.anatomyLead}</p>
        <div style={sx("display:flex;flex-direction:column;gap:0;text-align:start;max-width:420px;margin:0 auto")}>
          {features.map((f) => (
            <div key={f.label} style={sx(`display:flex;align-items:center;gap:12px;padding:11px 4px;border-top:1px solid var(--color-divider);font-size:13px;animation:ptRise .5s both;animation-delay:${f.delay}`)}>
              <span style={sx("width:5px;height:5px;border-radius:50%;background:var(--color-accent);flex-shrink:0;box-shadow:0 0 7px var(--color-accent)")} />
              <span style={sx("flex:1;opacity:0.85")}>{f.label}</span>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-primary" disabled style={{ marginTop: "var(--space-6)" }}>{t.anatomyCta}</button>
        <div dir="ltr" style={sx("font-size:10.5px;opacity:0.4;margin-top:var(--space-4);font-variant-numeric:tabular-nums")}>module: {manifest.id} · engine slot: {manifest.engine} / Z-Anatomy · plugs into patient profile — no app changes required</div>
      </div>
    </div>
  );
}
