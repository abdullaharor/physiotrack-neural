import { useAppCtx } from "../AppContext";
import { sx } from "../../lib/sx";
import { DX_META, type DxKey } from "../../data/registries";

/** Add-patient form modal. Faithful to v3 lines 482–508. */
export function AddPatientModal() {
  const { state, t, actions } = useAppCtx();
  const { form } = state;
  const dxKeys = Object.keys(DX_META) as DxKey[];

  return (
    <>
      <div style={sx("font-family:var(--font-heading);font-size:20px;animation:ptFadeSlide .4s both")}>{t.newPatientTitle}</div>
      <div className="field" style={sx("animation:ptFadeSlide .42s both")}>
        <label>{t.fieldName}</label>
        <input className="input" value={form.name} onChange={(e) => actions.setFormField("name", e.target.value)} />
      </div>
      <div style={sx("display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);animation:ptFadeSlide .46s both")}>
        <div className="field"><label>{t.fieldAge}</label><input className="input" type="number" value={form.age} onChange={(e) => actions.setFormField("age", e.target.value)} /></div>
        <div className="field">
          <label>{t.fieldGender}</label>
          <select className="input" value={form.gender} onChange={(e) => actions.setFormField("gender", e.target.value)}>
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
          </select>
        </div>
      </div>
      <div className="field" style={sx("animation:ptFadeSlide .5s both")}>
        <label>{t.fieldDiagnosis}</label>
        <input className="input" dir="ltr" value={form.diag} onChange={(e) => actions.setFormField("diag", e.target.value)} />
      </div>
      <div style={sx("display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);animation:ptFadeSlide .54s both")}>
        <div className="field">
          <label>{t.fieldRegion}</label>
          <select className="input" value={form.dxKey} onChange={(e) => actions.setFormField("dxKey", e.target.value)}>
            {dxKeys.map((k) => (
              <option key={k} value={k}>{DX_META[k][state.lang].label}</option>
            ))}
          </select>
        </div>
        <div className="field"><label>{t.fieldTotalSessions}</label><input className="input" type="number" value={form.total} onChange={(e) => actions.setFormField("total", e.target.value)} /></div>
      </div>
      <div style={sx("display:flex;gap:var(--space-2);justify-content:flex-end;margin-top:var(--space-2);animation:ptFadeSlide .58s both")}>
        <button type="button" className="btn btn-secondary" onClick={actions.closeModal}>{t.cancel}</button>
        <button type="button" className="btn btn-primary" onClick={actions.savePatient}>{t.saveButton}</button>
      </div>
    </>
  );
}
