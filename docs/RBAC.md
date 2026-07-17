# Role-Based Access Control (RBAC)

## Roles

- **Owner**
- **Clinic Admin**
- **Doctor**
- **Physiotherapist**
- **Receptionist**
- **Accountant** — exists **only if the Accounting module is enabled**
- **Device Technician**

## Conditional roles

The **Accountant** role is conditional on the Accounting module:

- Accounting **enabled** → the Accountant role and accountant invitations are
  available.
- Accounting **disabled** → the Accountant role is hidden, accountant invitations
  are hidden, and accounting navigation is hidden (see
  [`modules/ACCOUNTING.md`](./modules/ACCOUNTING.md)).

Other module-linked capabilities follow the same principle: a role's access to a
module's features is gated by whether that module is enabled and by the role's
permissions.

## Design vs. code split

- **Role screens, role previews, permission-management UI, navigation per role**
  → `DESIGN_THEN_CODE`. Designed and approved in Claude Design first (this is
  current-priority item #1 — see `ROADMAP.md`), then implemented.
- **Enforcement** (route guards, permission checks, conditional role
  availability, hiding nav/entry points) → `CODE_REQUIRED`, implemented against
  the approved design.

## Current status in the repo

The recreated v3 app is a single-therapist experience (Dr. Salma) with no RBAC
layer yet — it has no login, roles, or route guards. Full RBAC (the seven roles,
permission checks, conditional Accountant role, per-role navigation) is
**new work** that begins with the Roles & Permissions interfaces in Claude Design,
then is implemented here. Do not add role screens in code before their design is
approved.
