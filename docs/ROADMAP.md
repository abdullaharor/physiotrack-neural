# Roadmap & Gap Analysis

## Current priority (design first, then import, then implement)

Per the established workflow, the next work happens in **Claude Design**, in this
order:

1. Roles & Permissions interfaces
2. Integrations & Modules interfaces
3. Jarvis Integration interface
4. Anatomy Integration interface
5. Accounting Configuration interface
6. Medical Devices Integration interface

After approval for each: `Export → Project Archive` → import into this repository
as the approved visual reference → then Claude Code updates existing code
**incrementally** (never rebuild), preserving Git history, and passes the
Definition of Done gates.

> Until a design is approved and imported, Claude Code does not build these
> screens. This document tracks the target so implementation is fast once the
> designs land.

## Gap analysis — current repo vs. target

### Already in place
- Faithful v3 host UI (7 screens, modals, Jarvis chat + voice + boot OS), RTL.
- Integration boundaries for Jarvis, Anatomy, Devices under `src/integrations/`
  with DI registries and provider selection (`config.ts`).
- Jarvis: Mock + Remote providers, structured command schema, clinician
  confirmation gate (fail-closed), context bridge, browser voice adapter.

### To be added (code groundwork — `CODE_REQUIRED`, design-independent)
- **Disabled providers:** `DisabledJarvisProvider`,
  `DisabledAnatomyAtlasProvider`, `DisabledMedicalDeviceProvider`,
  `DisabledAccountingProvider`.
- **New providers:** `ExternalAnatomyAtlasProvider`,
  `RemoteMedicalDeviceProvider`, `InternalAccountingProvider`,
  `ExternalAccountingProvider`.
- **Accounting module** (new): provider contracts + Disabled/Internal/External
  modes + disable-hides-nav/invitations behavior.
- **Uniform module contract:** enable/disable registry, `health()`,
  `connection()`, `testConnection()`, `getLogs()` across all four modules.
- **Audit logging** for Jarvis commands/confirmations.
- **RBAC enforcement:** route guards + permission checks + conditional Accountant
  role (after role UIs are designed).
- **Tooling / Definition of Done scripts** (see below).

### To be designed first (`DESIGN_REQUIRED` / `DESIGN_THEN_CODE`)
- Roles & Permissions screens and role previews.
- The premium Integrations & Modules section + module cards.
- Each module's configuration page (Jarvis, Anatomy, Accounting, Medical Devices).

## Definition of Done tooling — status

The workflow requires **lint · type check · tests · production build** on every
change. Current `package.json` scripts:

- `typecheck` — present (`tsc --noEmit`).
- `build` — present (`tsc -b && vite build`).
- `lint` — **not yet configured** (add ESLint + a `lint` script).
- `test` — **not yet configured** (add a test runner, e.g. Vitest, + a `test`
  script).

Adding ESLint and a test runner is design-independent `CODE_REQUIRED` groundwork
and can proceed at any time. Until then, "run lint / run tests" in the Definition
of Done are aspirational for those two gates; `typecheck` and `build` are live.

> Note: this repo was assembled in an environment without access to the npm
> registry, so dependencies were not installed here. Run `npm install` locally
> before the Definition of Done gates.
