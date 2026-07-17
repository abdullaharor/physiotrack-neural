import { useEffect, useState } from "react";
import { PhysioTrackApp } from "../app/PhysioTrackApp";
import type { Lang } from "../i18n/strings";
import type { NavKey } from "../data/registries";
import { setJarvisProvider } from "../integrations/jarvis/provider";
import { MockJarvisProvider } from "../integrations/jarvis/MockJarvisProvider";
import { RemoteJarvisProvider } from "../integrations/jarvis/RemoteJarvisProvider";
import { DevToolbar } from "./DevToolbar";
import { DEFAULT_MODULE_STATE, MODULES, type DevModuleState, type ModuleKey } from "./modules";
import type { DevRole } from "./roles";

/**
 * PhysioTrackPreview — development-only wrapper that mounts the REAL
 * PhysioTrackApp with the design-preview harness. It never ships to production
 * (only src/preview.tsx uses it). It:
 *   - runs the real app with mock data (already the app's default — no backend),
 *   - lets the reviewer switch language, role, and module state,
 *   - reflects module enable/disable by hiding the module's sidebar item and
 *     (for Jarvis) the Jarvis UI, via the app's optional preview props.
 *
 * The production entry (src/main.tsx) renders <PhysioTrackApp/> directly with
 * none of these props, so production behavior is unchanged.
 */
export function PhysioTrackPreview() {
  const [lang, setLang] = useState<Lang>("ar");
  const [role, setRole] = useState<DevRole>("owner");
  const [modules, setModules] = useState<DevModuleState>(DEFAULT_MODULE_STATE);

  const setModule = (k: ModuleKey, patch: Partial<DevModuleState[ModuleKey]>) =>
    setModules((s) => ({ ...s, [k]: { ...s[k], ...patch } }));

  // Swap the Jarvis provider to match the selected provider (preview only).
  useEffect(() => {
    const j = modules.jarvis;
    if (j.enabled && j.provider === "remote") {
      setJarvisProvider(new RemoteJarvisProvider({ endpoint: "" })); // no endpoint in preview
    } else {
      setJarvisProvider(new MockJarvisProvider());
    }
  }, [modules.jarvis.enabled, modules.jarvis.provider]);

  // Hide the sidebar item of any disabled module that gates one.
  const hiddenNav: NavKey[] = MODULES
    .filter((m) => m.navKey && !modules[m.key].enabled)
    .map((m) => m.navKey as NavKey);

  return (
    <>
      <PhysioTrackApp
        key={lang}
        defaultLanguage={lang}
        showIntro={false}
        reducedMotion={false}
        showJarvis={modules.jarvis.enabled}
        hiddenNav={hiddenNav}
      />
      <DevToolbar
        lang={lang}
        setLang={setLang}
        role={role}
        setRole={setRole}
        modules={modules}
        setModule={setModule}
      />
    </>
  );
}
