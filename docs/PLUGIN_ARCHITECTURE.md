# Plugin Architecture

PhysioTrack is **modular**. The following capabilities are **not** hardcoded into
the application — they are replaceable plugins/modules:

1. **Jarvis AI**
2. **3D Anatomy Atlas**
3. **Accounting**
4. **Medical Devices**

> **Core rule:** the core clinic application must keep working normally if any
> optional module is disabled. Disabling a module hides its navigation and
> features but never breaks patients, appointments, assessments, or reports.

## What every module must provide

Each module must expose all of the following:

- **Provider interface** — a typed contract the module is programmed against.
- **Replaceable provider** — swappable via configuration/DI without touching the
  UI or the rest of the app.
- **Configuration page** — a dedicated page under Integrations & Modules.
- **Health status** — is the module healthy? (ok / degraded / error)
- **Connection status** — connected / disconnected / not configured.
- **Enable / Disable** — turn the whole module on or off.
- **Logs** — recent activity / audit entries for the module.
- **Test Connection** — an explicit action that probes the provider and reports
  the result.

## Shared module contract (target shape)

Every module's provider registry should expose a small, uniform surface so the
Integrations & Modules UI can render any module generically:

```ts
type ModuleStatus = "enabled" | "disabled";
type HealthState = "ok" | "degraded" | "error" | "unknown";
type ConnectionState = "connected" | "disconnected" | "not_configured";

interface ModuleProvider {
  readonly id: string;          // provider id (e.g. "mock", "remote", "disabled")
  readonly kind: string;        // module id (e.g. "jarvis")
  health(): Promise<HealthState>;
  connection(): ConnectionState;
  testConnection(): Promise<{ ok: boolean; message: string }>;
  getLogs(): Array<{ ts: string; level: string; message: string }>;
}

interface ModuleRegistry<P extends ModuleProvider> {
  status: ModuleStatus;         // enabled/disabled
  enable(): void;
  disable(): void;
  get(): P;                     // active provider
  set(provider: P): void;       // replace provider (DI)
}
```

Each capability then extends `ModuleProvider` with its own domain methods (chat
for Jarvis, launch for Anatomy, invoices for Accounting, device I/O for Medical
Devices). The four **`Disabled…Provider`** implementations satisfy the interface
by returning `disabled`/`not_configured` and no-op domain calls, guaranteeing the
core keeps working.

## Required providers per module

| Module | Required providers |
|---|---|
| Jarvis AI | `DisabledJarvisProvider`, `MockJarvisProvider`, `RemoteJarvisProvider` |
| 3D Anatomy Atlas | `DisabledAnatomyAtlasProvider`, `MockAnatomyAtlasProvider`, `ExternalAnatomyAtlasProvider` |
| Accounting | `DisabledAccountingProvider`, `InternalAccountingProvider`, `ExternalAccountingProvider` |
| Medical Devices | `DisabledMedicalDeviceProvider`, `MockMedicalDeviceProvider`, `RemoteMedicalDeviceProvider` |

Provider selection is configuration-based (see `src/integrations/config.ts`) and
swappable at runtime via each module's DI registry — no UI change required.

## Where this lives in the repo

The integration boundaries already exist under `src/integrations/`:

```
src/integrations/
├─ config.ts                 provider selection (config/env)
├─ jarvis/                   types · provider (DI) · Mock · Remote · voice · contextBridge · commandSchema · confirmation
├─ anatomy/                  types · provider (DI) · Mock
└─ devices/                  types · provider (DI) · Mock
```

See `ROADMAP.md` for the gap between what exists today and the full contract
above (Disabled providers, Accounting module, health/logs/test-connection, and
the enable/disable registry are groundwork still to be added — as `CODE_REQUIRED`
work, with the configuration **pages** gated behind Claude Design).
