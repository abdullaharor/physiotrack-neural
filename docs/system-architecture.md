# System Architecture (Phase 0 target)

Target architecture for the Jarvis Physiotherapy Platform. This is the plan;
almost none of the backend exists yet (see `current-state-audit.md`). Written to
be built **incrementally under the existing UI**, never as a rebuild.

## 1. Two independent halves

```
┌────────────────────────────┐        Connector SDK / Plugin API        ┌────────────────────────┐
│  Physiotherapy Clinic App  │  ◄──────────  structured commands  ──────►  │      Jarvis Core       │
│  (this repo + backend)     │              structured results             │  (separate service)    │
│  patients · appointments · │                                             │  intent · context ·    │
│  sessions · reports · 3D · │                                             │  reasoning · tools ·   │
│  treatment plans · devices │                                             │  safety · metering     │
│  Jarvis UI panel           │                                             │  (Codex / external)    │
└────────────────────────────┘                                             └────────────────────────┘
```

**Jarvis Core is never embedded in the app.** It is developed and deployed
separately and attaches to *any* host through the Connector SDK. The app hosts
only the Jarvis **UI**, **connector client**, **command receiver**, **confirmation
dialog**, **permission checks**, and **audit logging** — no Jarvis intelligence.

## 2. Command flow (authoritative)

```
Doctor speaks/types
  → Jarvis Core recognizes intent
  → Jarvis retrieves AUTHORIZED context (scoped to user/clinic/session)
  → Jarvis emits a structured command (with tenant + actor + subscription context)
  → Connector delivers it to the app backend
  → Backend RE-VALIDATES: identity, tenant, account status, device trust, role,
    permission, subscription, feature entitlement, resource scope, schema,
    safety policy, rate limit
  → App executes ONLY if all checks pass
  → App returns a structured result
  → Jarvis explains the result to the doctor
```

Two invariants: (1) **Jarvis never touches the patient database directly** — every
action goes through API → Connector SDK → approved tool → structured command →
authorization layer → audit log. (2) **A command existing does not mean it is
authorized;** the backend is the single source of truth for authorization.

## 3. Modular monolith (start here, split later)

Per §9, start as a **well-bounded modular monolith**, not premature
microservices. Each module owns its data and exposes an internal interface, so it
can later be extracted to a service without a rewrite.

| Module | Responsibility |
|---|---|
| Identity | Platform/Clinic owners, doctors, passkeys, sessions, device trust |
| Organization | Tenants (clinics), branches, org settings |
| Subscription | Plans, billing metadata, lifecycle (active/grace/suspended) |
| Entitlement | Feature flags, limits, seat checks, usage metering, overrides |
| Patient | Patient records (tenant-scoped) |
| Appointment | Scheduling |
| Session | Treatment sessions |
| Connector | Jarvis transport: auth, commands, events, retry, health, capabilities |
| Anatomy | 3D atlas provider adapter |
| Audit | Immutable audit log of sensitive actions + authorization decisions |
| Notification | Alerts/notifications |
| File | Object storage (tenant-scoped paths) |
| Analytics | Metrics (tenant-scoped) |

## 4. Trust boundaries

1. **Client ↔ Backend** — the client (this UI) is untrusted for authorization.
   Every entitlement/permission/tenant check is server-side.
2. **App ↔ Jarvis Core** — Jarvis is a distinct trust domain reached only via the
   Connector with its own service account; it holds no standing privileges and
   acts only within the current user/clinic/session/device/permission/plan.
3. **Tenant ↔ Tenant** — hard isolation by `organizationId` at every layer
   (`multi-tenant-architecture.md`).
4. **Platform Owner ↔ Clinic** — the Platform Owner console is separate from the
   clinic app; owners cannot reach clinic patient data casually, and clinic users
   cannot reach platform controls.

## 5. Cross-cutting requirements

Stateless APIs · horizontal scaling · queue for heavy jobs · tenant-aware cache
keys · per-clinic rate limiting · AI usage metering · DB indexing · connection
pooling · object storage · background workers · health checks · metrics ·
centralized logs · tracing. (Detailed in the scaling phase; none exist yet.)

## 6. Frontend architecture (evolution of the current app)

- Keep the Nocturne design system, the screens, the modal system, and the Jarvis
  UI. Add a **router** with guarded routes, an **entitlement-aware UI** layer
  (features/limits come from the backend, never hardcoded), and connect the
  existing `integrations/*` provider pattern to the real Connector/Anatomy/Device
  backends. The dev preview harness remains dev-only.

## 7. ADRs (to be authored in Phase 1)

Record decisions as `docs/adr/NNN-title.md`. Initial set:

- ADR-001 Modular monolith over microservices (for current scale).
- ADR-002 Shared-DB multi-tenancy with `organizationId` + hybrid dedicated path.
- ADR-003 Jarvis Core as an external service via Connector SDK.
- ADR-004 Passkey/WebAuthn-first, closed (no public signup) identity.
- ADR-005 Config-driven subscriptions/entitlements (no hardcoded limits).
- ADR-006 Provider/adapter pattern for Jarvis, Anatomy, Devices, Accounting.

> Status: **NOT IMPLEMENTED** — this document is the Phase 0 target. No modules,
> APIs, or ADR files exist in the repo yet.
