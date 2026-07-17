# Module: Accounting

Accounting is **optional**. The clinic runs fully without it.

## Modes

- **Disabled**
- **Internal** (accounting handled inside PhysioTrack)
- **External** (accounting delegated to an external system)

## Required providers

- `DisabledAccountingProvider`
- `InternalAccountingProvider`
- `ExternalAccountingProvider`

## Dedicated "Accounting Configuration" page

Inside Integrations & Modules: mode selection (Disabled / Internal / External),
provider configuration, health, connection status, **Test Connection**, and
**logs**.

## Behavior when disabled

When Accounting is disabled:

- **Hide accounting navigation.**
- **Hide accountant invitations.**
- The **Accountant role exists only when Accounting is enabled** (see `RBAC.md`).
- **Keep all clinic features working normally** (patients, appointments,
  assessments, reports, team are unaffected).

## Current status in the repo

Not yet present. The v3 UI included an Invoices screen (billing overview) but no
Accounting *module*. Accounting is **new module groundwork**:

- Its **provider contracts** (`Disabled` / `Internal` / `External`) and the
  enable/disable + hide-nav behavior are `CODE_REQUIRED`.
- Its **Configuration page** and any new screens are `DESIGN_REQUIRED` (design in
  Claude Design first).

Until the module exists, the existing Invoices screen remains as-is; do not
redesign it without an approved design.
