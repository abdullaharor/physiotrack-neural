import { useState } from "react";
import type { Lang } from "../i18n/strings";
import { DEV_ROLES, type DevRole } from "./roles";
import { MODULES, type DevModuleState, type ModuleKey } from "./modules";

/**
 * DevToolbar — development-only floating control panel for the design preview.
 *
 * NOT part of the product. It renders only in the preview entry
 * (src/preview.tsx) and never in production (src/main.tsx). It exposes:
 *   - language (AR/RTL ↔ EN/LTR)
 *   - a role switcher (preview only; RBAC enforcement not implemented yet)
 *   - a module-state switcher (enable/disable + provider) for the 4 modules
 *
 * It is intentionally styled distinctly (dashed accent, "DEV" badge) so it can
 * never be mistaken for approved product UI.
 */
export function DevToolbar(props: {
  lang: Lang;
  setLang: (l: Lang) => void;
  role: DevRole;
  setRole: (r: DevRole) => void;
  modules: DevModuleState;
  setModule: (k: ModuleKey, patch: Partial<DevModuleState[ModuleKey]>) => void;
}) {
  const [open, setOpen] = useState(true);
  const isAr = props.lang === "ar";

  const shell: React.CSSProperties = {
    position: "fixed", bottom: 18, insetInlineStart: 18, zIndex: 200,
    width: open ? 320 : "auto", fontFamily: "var(--font-body)", direction: isAr ? "rtl" : "ltr",
    background: "color-mix(in srgb, var(--color-surface) 94%, black)",
    border: "1px dashed var(--color-accent)", borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)", color: "var(--color-text)", overflow: "hidden",
  };
  const header: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer",
    borderBottom: open ? "1px solid var(--color-divider)" : "none",
  };
  const badge: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
    color: "var(--color-accent-900)", background: "var(--color-accent)", borderRadius: 6, padding: "2px 7px",
  };
  const section: React.CSSProperties = { padding: "10px 12px", borderBottom: "1px solid var(--color-divider)" };
  const label: React.CSSProperties = { fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.55, marginBottom: 6 };
  const select: React.CSSProperties = {
    width: "100%", padding: "6px 8px", fontSize: 12, borderRadius: 8,
    background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-divider)",
  };

  return (
    <div style={shell}>
      <div style={header} onClick={() => setOpen(!open)}>
        <span style={badge}>DEV</span>
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{isAr ? "معاينة التصميم" : "Design Preview"}</span>
        <span style={{ opacity: 0.6, fontSize: 12 }}>{open ? "▾" : "▸"}</span>
      </div>

      {open && (
        <>
          <div style={section}>
            <div style={label}>{isAr ? "اللغة" : "Language"}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["ar", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => props.setLang(l)}
                  className={props.lang === l ? "btn btn-primary" : "btn btn-secondary"}
                  style={{ flex: 1, fontSize: 12 }}
                >
                  {l === "ar" ? "العربية (RTL)" : "English (LTR)"}
                </button>
              ))}
            </div>
          </div>

          <div style={section}>
            <div style={label}>{isAr ? "الدور (معاينة فقط — بلا تطبيق صلاحيات)" : "Role (preview only — no enforcement)"}</div>
            <select
              style={select}
              value={props.role}
              onChange={(e) => props.setRole(e.target.value as DevRole)}
            >
              {DEV_ROLES.map((r) => (
                <option key={r.key} value={r.key} disabled={r.moduleGated === "accounting" && !props.modules.accounting.enabled}>
                  {isAr ? r.ar : r.en}
                  {r.moduleGated === "accounting" && !props.modules.accounting.enabled ? (isAr ? " — يتطلب المحاسبة" : " — needs Accounting") : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={{ ...section, borderBottom: "none" }}>
            <div style={label}>{isAr ? "حالة الوحدات" : "Module state"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MODULES.map((m) => {
                const st = props.modules[m.key];
                return (
                  <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => props.setModule(m.key, { enabled: !st.enabled })}
                      title={st.enabled ? "enabled" : "disabled"}
                      style={{
                        width: 34, height: 20, borderRadius: 999, flexShrink: 0, position: "relative", cursor: "pointer",
                        border: "1px solid var(--color-divider)",
                        background: st.enabled ? "var(--color-accent)" : "var(--color-neutral-800)",
                        transition: "background .2s",
                      }}
                    >
                      <span style={{
                        position: "absolute", top: 2, insetInlineStart: st.enabled ? 16 : 2, width: 14, height: 14,
                        borderRadius: "50%", background: "var(--color-bg)", transition: "inset-inline-start .2s",
                      }} />
                    </button>
                    <span style={{ flex: 1, fontSize: 12, opacity: st.enabled ? 1 : 0.5 }}>{isAr ? m.ar : m.en}</span>
                    <select
                      style={{ ...select, width: 96, opacity: st.enabled ? 1 : 0.5 }}
                      value={st.provider}
                      disabled={!st.enabled}
                      onChange={(e) => props.setModule(m.key, { provider: e.target.value })}
                    >
                      {m.providers.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}{p.implemented ? "" : " *"}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 9.5, opacity: 0.45, marginTop: 8, lineHeight: 1.5 }}>
              {isAr
                ? "* مزوّد غير مُنفّذ بعد — يعود للـ Mock. تعطيل الوحدة يخفي عنصرها في الشريط الجانبي (معاينة فقط)."
                : "* provider not implemented yet — falls back to Mock. Disabling a module hides its sidebar item (preview only)."}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
