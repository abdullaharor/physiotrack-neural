import { useAppCtx } from "../AppContext";
import { Box } from "../../lib/Box";
import { sx } from "../../lib/sx";
import { DX_META, type DxKey } from "../../data/registries";

/** Assessment area picker. Faithful to v3 lines 511–521. */
export function PickAreaModal() {
  const { state, t, actions } = useAppCtx();
  const dxKeys = Object.keys(DX_META) as DxKey[];
  return (
    <>
      <div style={sx("font-family:var(--font-heading);font-size:20px;animation:ptFadeSlide .4s both")}>{t.chooseArea}</div>
      <div style={sx("display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)")}>
        {dxKeys.map((k, i) => {
          const o = DX_META[k][state.lang];
          return (
            <Box
              key={k}
              onClick={() => actions.pickDx(k)}
              sx={`padding:var(--space-6) var(--space-4);border-radius:var(--radius-md);background:color-mix(in srgb, var(--color-bg) 50%, transparent);border:1px solid var(--color-divider);cursor:pointer;text-align:center;animation:ptFadeSlide .5s both;animation-delay:${i * 55}ms;transition:transform .3s cubic-bezier(.34,1.6,.64,1),border-color .25s,box-shadow .25s`}
              hover="transform:translateY(-3px);border-color:var(--color-accent);box-shadow:0 0 20px color-mix(in srgb, var(--color-accent) 14%, transparent)"
              active="transform:scale(.96)"
            >
              <div style={sx("font-weight:600;font-size:14.5px")}>{o.label}</div>
              <div style={sx("font-size:11.5px;opacity:0.55;margin-top:5px;line-height:1.45")}>{o.desc}</div>
            </Box>
          );
        })}
      </div>
    </>
  );
}
