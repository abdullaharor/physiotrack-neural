# Build Progress

Live status of the continuous build. Continue from the latest Git commit.

## Environment constraints (this sandbox)
- **npm registry blocked** → backend deps not installable here; cannot compile
  (needs `@prisma/client` generated), migrate, or run tests in-sandbox.
- **No PostgreSQL server** (psql client only) → cannot run migrations/DB here.
- **GitHub push blocked** → commits are local; delivered as bundle/zip to push.
- Verified here instead: **esbuild syntax-check passes on all backend TS**, and
  the frontend bundles + renders. Full `install → generate → migrate → test →
  build` must run on a networked machine / Blink.

## Phase status
| Phase | Title | Status |
|---|---|---|
| 0 | Current audit + planning docs | ✅ done (`990132c`) |
| 1 | Architecture foundation (ADRs, boundaries) | ✅ done |
| 2 | Multi-tenant foundation | 🟡 core done (context, scoping, org model); RLS migration + full isolation tests pending |
| 3 | Identity & access | 🟡 sessions, password (Argon2id), activation, provisioning, device model done; **WebAuthn/passkey flow NOT IMPLEMENTED** |
| 4 | Subscription & entitlements | 🟡 plan catalog + entitlement service + doctor-seat enforcement done; usage metering + upgrade/downgrade flows pending |
| 5 | Jarvis Core (external) | 🔜 connector command-receiver skeleton next; Core itself is external |
| 6 | Connector SDK | 🔜 next |
| 7 | Clinic app ↔ backend integration | ⛔ NOT STARTED (frontend still on mock providers) |
| 8 | Anatomy adapter | ⛔ NOT STARTED |
| 9 | Clinical knowledge | ⛔ NOT STARTED |
| 10 | Voice / Saudi Arabic | ⛔ NOT STARTED |
| 11 | Security & privacy hardening | 🟡 partial (helmet, rate-limit, argon2, audit, tenant guards); encryption-at-rest, prompt-injection tests pending |
| 12 | Scaling & reliability | ⛔ NOT STARTED |
| 13 | Full testing | 🟡 unit tests (tenant/RBAC/plans) written; DB integration + E2E pending |
| 14 | Final verification | ⛔ NOT STARTED |

## Implemented backend surface
- Fastify server, helmet, cookies, per-clinic rate limiting, uniform error envelope.
- Tenant context (ALS) with `requireOrgScope` / `assertSameTenant` / `tenantWhere`.
- RBAC deny-by-default (roles + permissions + policy).
- Entitlement service (config plan catalog, feature gate, doctor-seat enforcement, audited).
- Auth: login (Argon2id), activation (single-use token), refresh with **reuse detection**, logout, `/auth/me`.
- APIs: `POST/GET /platform/organizations` (+suspend), `POST/GET /clinic/doctors` (+suspend), `GET /clinic/seats`, `POST/GET/GET:id/PATCH /patients`, `/health`, `/ready`.
- Audit service on every sensitive action + allow/deny decision.

## Explicitly NOT IMPLEMENTED yet
WebAuthn/passkeys · Jarvis connector + command re-validation · anatomy/device/
accounting backend providers · appointments/sessions endpoints · frontend↔backend
wiring · PostgreSQL RLS migration · usage metering · load/E2E/DB-integration tests
· deployment config/CI/rollback.

## Next steps (continue from git)
1. Jarvis Connector: command receiver that re-validates identity/tenant/role/
   permission/subscription/feature/scope/schema/rate-limit before executing.
2. Appointments + sessions endpoints (tenant-scoped).
3. PostgreSQL RLS migration (defense-in-depth).
4. Frontend: replace mock providers with a real API client behind the existing
   `integrations/*` boundaries (no redesign).
5. WebAuthn passkey enrollment + login.
