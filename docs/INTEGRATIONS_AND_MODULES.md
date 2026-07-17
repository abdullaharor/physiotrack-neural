# Integrations & Modules

A premium **Integrations & Modules** section is the single place to manage every
optional plugin. It contains one card per module:

1. Jarvis AI
2. 3D Anatomy Atlas
3. Accounting
4. Medical Devices

## Module card

Each module card must display:

- **Name**
- **Status** (enabled / disabled)
- **Provider** (active provider, e.g. Mock / Remote / Disabled / Internal / External)
- **Version**
- **Last Connection**
- **Health** (ok / degraded / error / unknown)
- **Configure** (opens the module's dedicated configuration page)
- **Test Connection** (runs `testConnection()` and shows the result)
- **Logs** (opens the module's recent activity / audit log)

## Dedicated configuration pages

Each module has its own page, reached from its card's **Configure** action:

- **Jarvis Integration** — see [`modules/JARVIS.md`](./modules/JARVIS.md)
- **Anatomy Integration** — see [`modules/ANATOMY.md`](./modules/ANATOMY.md)
- **Accounting Configuration** — see [`modules/ACCOUNTING.md`](./modules/ACCOUNTING.md)
- **Medical Devices Integration** — see [`modules/MEDICAL_DEVICES.md`](./modules/MEDICAL_DEVICES.md)

## Design vs. code split

- The **visual design** of this section, the module cards, and each
  configuration page is `DESIGN_REQUIRED` — it must be designed and approved in
  Claude Design first, then exported and imported (current-priority work; see
  `ROADMAP.md`).
- The **provider contracts, enable/disable registry, health/connection/test/logs
  wiring, and provider selection** are `CODE_REQUIRED` and are implemented by
  Claude Code against the approved design.

## Behavior when a module is disabled

Disabling a module must:

- Hide that module's navigation entries and entry points.
- Stop its background activity and connections.
- Keep all core clinic features (patients, appointments, assessments, reports,
  team) fully working.

Accounting has an extra rule: when disabled, also hide accountant invitations and
the Accountant role (see `RBAC.md`).
