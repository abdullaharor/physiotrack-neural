import { useAppCtx } from "../AppContext";
import { Box, S } from "../../lib/Box";
import { Icon, ICONS } from "../../lib/icons";
import { sx } from "../../lib/sx";
import { SEV_META } from "../../cdss/engine";
import { mkRow } from "../rows";

/** Dashboard — KPI cards, active-patient list, CDSS insight preview and the
 *  anatomy teaser. Faithful to v3 lines 128–201. */
export function Dashboard() {
  const { state, t, actions, activeInsights } = useAppCtx();
  const isAr = state.lang === "ar";
  const { patients, kpiT: kt } = state;

  const recovery = Math.round(patients.reduce((a, p) => a + p.recovery, 0) / patients.length) || 0;
  const pendingCount = patients.filter((p) => p.invoice === "pending").length;

  const kpis = [
    { label: t.kpiTotalPatients, value: String(Math.round(patients.length * kt)), meta: t.kpiMeta1, icon: ICONS.patients, delay: "0ms" },
    { label: t.kpiSessionsToday, value: String(Math.round(5 * kt)), meta: t.kpiMeta2, icon: ICONS.appointments, delay: "60ms" },
    { label: t.kpiRecoveryRate, value: Math.round(recovery * kt) + "%", meta: t.kpiMeta3, icon: ICONS.dashboard, delay: "120ms" },
    { label: t.kpiPendingInvoices, value: String(Math.round(pendingCount * kt)), meta: t.kpiMeta4, icon: ICONS.invoices, delay: "180ms" },
  ];

  const rows = patients.map((p, i) => mkRow(p, i, t, isAr));
  const dashInsights = activeInsights().slice(0, 5);

  return (
    <>
      <div style={sx("display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4)")}>
        {kpis.map((k) => (
          <Box
            key={k.label}
            sx={`padding:var(--space-4);border-radius:var(--radius-md);background:linear-gradient(160deg, color-mix(in srgb, var(--color-surface) 92%, var(--color-section-glow)) 0%, var(--color-surface) 70%);border:1px solid var(--color-divider);animation:ptRise .55s cubic-bezier(.22,.8,.36,1) both;animation-delay:${k.delay};transition:transform .35s cubic-bezier(.3,1.3,.5,1),box-shadow .35s`}
            hover="transform:translateY(-4px);box-shadow:var(--shadow-md)"
          >
            <S sx="display:flex;align-items:center;justify-content:space-between;gap:8px">
              <span style={sx("font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-accent)")}>{k.label}</span>
              <Icon html={k.icon} sx="width:16px;height:16px;display:flex;opacity:0.5" />
            </S>
            <div style={sx("font-family:var(--font-heading);font-size:34px;font-weight:500;letter-spacing:-0.02em;margin-top:10px;font-variant-numeric:tabular-nums")}>{k.value}</div>
            <div style={sx("font-size:11px;opacity:0.5;margin-top:4px")}>{k.meta}</div>
          </Box>
        ))}
      </div>

      <div style={sx("display:grid;grid-template-columns:1fr 320px;gap:var(--space-4);margin-top:var(--space-4);align-items:start")}>
        <div style={sx("padding:var(--space-4);border-radius:var(--radius-md);background:var(--color-surface);border:1px solid var(--color-divider);animation:ptRise .55s cubic-bezier(.22,.8,.36,1) both;animation-delay:180ms")}>
          <S sx="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2)">
            <h2 style={sx("font-size:15px;margin:0")}>{t.activePatientsTitle}</h2>
            <span className="btn btn-ghost" onClick={() => actions.go("patients")} style={{ cursor: "pointer" }}>{t.viewAll}</span>
          </S>
          <div style={sx("display:flex;flex-direction:column")}>
            {rows.map((p) => (
              <Box
                key={p.id}
                onClick={() => actions.openProfile(p.id)}
                sx={`display:flex;align-items:center;gap:14px;padding:13px 10px;border-top:1px solid var(--color-divider);cursor:pointer;border-radius:var(--radius-sm);animation:ptRise .5s cubic-bezier(.22,.8,.36,1) both;animation-delay:${p.delay};transition:background .25s,transform .25s`}
                hover="background:color-mix(in srgb, var(--color-text) 5%, transparent)"
                active="transform:scale(.99)"
              >
                <div style={sx("width:40px;height:40px;border-radius:12px;flex-shrink:0;display:grid;place-items:center;font-weight:600;font-size:14px;background:var(--color-accent-900);color:var(--color-accent-200);box-shadow:inset 0 0 0 1px var(--color-accent-800)")}>{p.initials}</div>
                <div style={sx("width:170px;flex-shrink:0;min-width:0")}>
                  <div style={sx("font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{p.name}</div>
                  <div dir="ltr" style={sx("font-size:11.5px;opacity:0.55;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{p.diag}</div>
                </div>
                <div style={sx("flex:1;min-width:0")}>
                  <div style={sx("display:flex;justify-content:space-between;gap:10px;font-size:10.5px;opacity:0.55;margin-bottom:6px")}>
                    <span style={{ whiteSpace: "nowrap" }}>{t.progress}</span>
                    <span style={{ whiteSpace: "nowrap" }}>{p.sessionsLabel}</span>
                  </div>
                  <div style={sx("height:4px;border-radius:4px;background:var(--color-neutral-800);overflow:hidden")}>
                    <div style={sx(`height:100%;border-radius:4px;background:linear-gradient(90deg, var(--color-accent-600), var(--color-accent));width:${p.pct}%;animation:ptGrow 1s cubic-bezier(.22,.8,.36,1) both;animation-delay:${p.delay}`)} />
                  </div>
                </div>
                <div style={sx("width:96px;flex-shrink:0;text-align:end;font-size:12px;opacity:0.75;white-space:nowrap")}>
                  <div>{p.apptDay}</div>
                  <div style={sx("font-weight:600;color:var(--color-text)")}>{p.apptTime}</div>
                </div>
              </Box>
            ))}
          </div>
        </div>

        <div style={sx("display:flex;flex-direction:column;gap:var(--space-4)")}>
          <div style={sx("padding:var(--space-4);border-radius:var(--radius-md);background:var(--color-surface);border:1px solid var(--color-divider);animation:ptRise .55s cubic-bezier(.22,.8,.36,1) both;animation-delay:240ms")}>
            <S sx="display:flex;align-items:center;gap:8px;margin-bottom:var(--space-3)">
              <h2 style={sx("font-size:15px;margin:0;flex:1")}>{t.cdssTitle}</h2>
              <span className="tag tag-outline" style={{ whiteSpace: "nowrap" }}>{t.cdssTag}</span>
            </S>
            <div style={sx("display:flex;flex-direction:column;gap:8px")}>
              {dashInsights.map((ins, i) => {
                const meta = SEV_META[ins.sev];
                return (
                  <Box
                    key={ins.key}
                    onClick={() => actions.openProfile(ins.patientId)}
                    sx={`display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-md);background:color-mix(in srgb, ${meta.color} 6%, transparent);border-inline-start:2px solid ${meta.color};cursor:pointer;animation:ptRise .5s both;animation-delay:${Math.min(i * 60, 300)}ms;transition:background .25s`}
                    hover="background:color-mix(in srgb, var(--color-text) 6%, transparent)"
                  >
                    <span style={sx("flex:1;min-width:0")}>
                      <span style={sx("display:block;font-size:11px;opacity:0.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{ins.patientName}</span>
                      <span style={sx("display:block;font-size:12px;font-weight:500;line-height:1.45;margin-top:1px")}>{ins.title}</span>
                    </span>
                    <span style={sx(`font-size:9px;letter-spacing:0.07em;text-transform:uppercase;padding:2px 7px;border-radius:6px;background:color-mix(in srgb, ${meta.color} 13%, transparent);color:${meta.color};white-space:nowrap;flex-shrink:0`)}>{t[meta.labelKey as keyof typeof t]}</span>
                  </Box>
                );
              })}
            </div>
            <div style={sx("font-size:10px;opacity:0.4;line-height:1.5;margin-top:var(--space-3)")}>{t.cdssDisclaimer}</div>
          </div>

          <Box
            onClick={() => actions.go("anatomy")}
            sx="position:relative;overflow:hidden;padding:var(--space-4);border-radius:var(--radius-md);background:linear-gradient(150deg, color-mix(in srgb, var(--color-section) 62%, var(--color-surface)), var(--color-surface) 78%);border:1px solid var(--color-divider);cursor:pointer;animation:ptRise .55s both;animation-delay:300ms;transition:transform .35s cubic-bezier(.3,1.3,.5,1),box-shadow .35s"
            hover="transform:translateY(-3px);box-shadow:var(--shadow-md)"
          >
            <S sx="display:flex;align-items:center;gap:8px">
              <span className="tag tag-outline">{t.soonTag}</span>
            </S>
            <div style={sx("font-family:var(--font-heading);font-size:17px;margin-top:10px")}>{t.anatomyTitle}</div>
            <div style={sx("font-size:12px;opacity:0.6;margin-top:4px;line-height:1.5")}>{t.anatomyTeaser}</div>
            <div style={sx("position:absolute;inset-inline-end:-30px;bottom:-30px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle, color-mix(in srgb, var(--color-section-ghost) 55%, transparent), transparent 70%)")} />
          </Box>
        </div>
      </div>
    </>
  );
}
