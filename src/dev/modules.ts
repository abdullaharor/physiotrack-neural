/**
 * Development-only module-state model for the preview harness.
 *
 * Lets the preview toggle each optional module on/off and pick a provider, so
 * a reviewer can see the intended plugin behavior. Effects that are actually
 * wired today (dev-preview only, production untouched):
 *   - jarvis.enabled   → shows/hides the Jarvis UI (panel + FAB + boot)
 *   - anatomy.enabled  → shows/hides the "Anatomy" sidebar item
 *   - devices.enabled  → shows/hides the "Devices" sidebar item
 *   - accounting.enabled → shows/hides the "Invoices" sidebar item (the only
 *     accounting-adjacent screen that exists; the Accounting MODULE/UI is not
 *     built yet — see docs/modules/ACCOUNTING.md)
 *
 * Provider dropdowns list the target providers from the plugin spec; providers
 * that are not implemented yet are marked and fall back to the existing mock.
 */
import type { NavKey } from "../data/registries";

export type ModuleKey = "jarvis" | "anatomy" | "accounting" | "devices";

export interface ModuleDef {
  key: ModuleKey;
  en: string;
  ar: string;
  /** Sidebar nav item this module gates in preview (if any). */
  navKey?: NavKey;
  /** Target providers (some not implemented yet — flagged). */
  providers: Array<{ id: string; label: string; implemented: boolean }>;
}

export const MODULES: ModuleDef[] = [
  {
    key: "jarvis", en: "Jarvis AI", ar: "جارفس",
    providers: [
      { id: "disabled", label: "Disabled", implemented: false },
      { id: "mock", label: "Mock", implemented: true },
      { id: "remote", label: "Remote", implemented: true },
    ],
  },
  {
    key: "anatomy", en: "3D Anatomy Atlas", ar: "أطلس التشريح", navKey: "anatomy",
    providers: [
      { id: "disabled", label: "Disabled", implemented: false },
      { id: "mock", label: "Mock", implemented: true },
      { id: "external", label: "External", implemented: false },
    ],
  },
  {
    key: "accounting", en: "Accounting", ar: "المحاسبة", navKey: "invoices",
    providers: [
      { id: "disabled", label: "Disabled", implemented: false },
      { id: "internal", label: "Internal", implemented: false },
      { id: "external", label: "External", implemented: false },
    ],
  },
  {
    key: "devices", en: "Medical Devices", ar: "الأجهزة الطبية", navKey: "devices",
    providers: [
      { id: "disabled", label: "Disabled", implemented: false },
      { id: "mock", label: "Mock", implemented: true },
      { id: "remote", label: "Remote", implemented: false },
    ],
  },
];

export interface ModuleState { enabled: boolean; provider: string }
export type DevModuleState = Record<ModuleKey, ModuleState>;

export const DEFAULT_MODULE_STATE: DevModuleState = {
  jarvis: { enabled: true, provider: "mock" },
  anatomy: { enabled: true, provider: "mock" },
  accounting: { enabled: true, provider: "internal" }, // enabled here only so the accounting-adjacent Invoices screen is visible in preview
  devices: { enabled: true, provider: "mock" },
};
