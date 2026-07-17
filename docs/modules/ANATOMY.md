# Module: 3D Anatomy Atlas

Treat the Anatomy Atlas as an **external plugin**. It is not hardcoded into the
app; the core works with it disabled.

## Required providers

- `DisabledAnatomyAtlasProvider` — module off; anatomy entry points hidden.
- `MockAnatomyAtlasProvider` — reports the module manifest as "coming soon"; no
  rendering (current default).
- `ExternalAnatomyAtlasProvider` — mounts a real external 3D engine
  (e.g. Three.js / Z-Anatomy dataset), launched from a patient profile with the
  model matched to the patient's record.

## Dedicated "Anatomy Integration" page

Inside Integrations & Modules: enable/disable, active provider selection
(Disabled / Mock / External), engine/dataset configuration, health, connection
status, **Test Connection**, and **logs**.

## Current status in the repo

Implemented under `src/integrations/anatomy/`: `types.ts`
(`AnatomyAtlasProvider`), `MockAnatomyAtlasProvider`, `provider.ts` (DI). The
Anatomy screen (`app/screens/Anatomy.tsx`) renders from the provider manifest.

**Groundwork still to add** (`CODE_REQUIRED`; page visuals `DESIGN_REQUIRED`):
`DisabledAnatomyAtlasProvider`, `ExternalAnatomyAtlasProvider`, enable/disable,
health/connection/test/logs, and the Anatomy Integration page.
