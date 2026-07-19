# Current-State Audit (Phase 0)

**Scope:** factual audit of the repository as it exists today, with no code
changes. Findings are drawn from the committed source at HEAD
`70b1a8c` (branch `main`). This is the baseline every later phase builds on.

> Headline: the repository is a **frontend-only clinic UI**. The multi-tenant
> SaaS, subscriptions, identity/access, backend APIs, database, and Jarvis Core
> described in the master spec are **NOT IMPLEMENTED** today. Nothing here is
> "wrong" — it is an approved UI host. Phase 0 records the gap so Phases 1–14
> add the platform underneath it without a rebuild.

## 1. Stack

| Aspect | Finding |
|---|---|
| Language / framework | React 18.3 + TypeScript 5.5 (strict) + Vite 5.4 |
| Size | 55 source files, ~4,430 LOC under `src/` |
| Runtime deps | `react`, `react-dom` only |
| Navigation | **State-based** (`state.view` via `go()`), **no router**, no URLs |
| Data | In-memory mock (`seedPatients()`), no persistence |
| Backend | **None** |
| Database / ORM | **None** (no Prisma/Sequelize/TypeORM/pg/Mongo/SQLite) |
| Migrations | **None** (`MIGRATION.md` is a design→code doc, not DB migrations) |
| Network calls | None active; `RemoteJarvisProvider` / `RemoteMedicalDeviceProvider` are opt-in stubs, unwired |
| Styling | Nocturne design system (`src/styles/nocturne.css`, verbatim) + `global.css` |
| i18n | Arabic (RTL, default) + English (LTR) — `src/i18n/strings.ts` |

## 2. Project structure

```
src/
├─ main.tsx / preview.tsx        entry (production / design-preview)
├─ app/                          PhysioTrackApp, Sidebar, Header, ScreenArea
│  ├─ screens/                   Dashboard, Patients, Appointments, Invoices, Team, Anatomy, Devices
│  ├─ modals/                    Profile, AddPatient, PickArea, Assessment, Report, InsightCard, ConfirmHost
│  └─ jarvis/                    JarvisLayer (chat + FAB), BootOS (JARVIS OS)
├─ cdss/engine.ts                deterministic clinical-insight rules (host-side)
├─ data/                         registries.ts, seed.ts (mock)
├─ i18n/strings.ts               AR/EN
├─ integrations/                 jarvis / anatomy / devices provider boundaries (+ config.ts)
├─ lib/                          sx (CSS-string→style), Box (hover/active/focus), icons
├─ dev/                          development-only preview harness (role + module switcher)
└─ styles/                       nocturne.css (verbatim) + global.css
```

## 3. Build / Lint / Tests

| Gate | Status |
|---|---|
| Build (`tsc -b && vite build`) | **Cannot run in this environment** (npm registry blocked, no `node_modules`). Verified indirectly: an esbuild bundle of the full tree succeeds (all imports resolve) and renders in a real browser. Run `npm install && npm run build` locally to confirm. |
| Type check (`tsc --noEmit`) | Script exists; not runnable here (no `@types/react` installed). |
| Lint | **NOT CONFIGURED** — no ESLint config, no `lint` script. |
| Tests | **NONE** — no test runner (Vitest/Jest), no `*.test.*` files. |

## 4. Authentication & accounts

- **No authentication** of any kind: no login/signin, no signup/registration, no
  OAuth/social login, no Passkey/WebAuthn, no JWT, no password hashing.
- **No accounts:** no demo accounts, no default admin, no master password, no
  backdoor, no secret URLs. (Requirement §11/§33 currently satisfied *by absence*
  — there is nothing to remove, but everything to build.)
- The app is effectively a **single-therapist** view (Dr. Salma), hardcoded in
  i18n strings for display only.

## 5. Roles & permissions

- **No RBAC enforcement.** No route guards, no `authorize`/`deny` logic. The
  `role` identifiers in code are Jarvis chat-message roles (`user`/`assistant`)
  and a display string, not access control.
- `src/dev/roles.ts` lists the 7 target roles, but **for the dev preview switcher
  only** — no enforcement.
- Target roles (Platform Owner, Clinic Owner, Doctor, …) and the Jarvis service
  account: **NOT IMPLEMENTED**.

## 6. Owner / Clinic-Owner / Platform-Owner systems

- **NOT IMPLEMENTED.** No Platform Owner console, no Clinic Owner, no provisioning
  flows, no device trust, no activation tokens.

## 7. Database

- **NOT IMPLEMENTED.** No schema, no tables, no migrations, no constraints, no
  `organizationId` on any record. All "records" are in-memory mock objects
  (`Patient`, `AssessmentRecord`) with no tenant key.

## 8. Jarvis

- Present as a **connector boundary + UI**, not a Core:
  - `integrations/jarvis/types.ts` — `JarvisProvider` / `JarvisChatAdapter` /
    `JarvisVoiceAdapter` interfaces.
  - `MockJarvisProvider` (default), `RemoteJarvisProvider` (unwired stub).
  - `commandSchema.ts` — a **partial** structured command schema
    (`navigate`, `open_patient`, `start_assessment`, `add_patient`,
    `update_patient`, `set_insight_status`, `add_record_note`) with validation.
  - `confirmation.ts` — clinician-confirmation gate, **fail-closed**.
  - `contextBridge.ts` — read-only clinic context builder.
  - UI: `JarvisLayer` (chat + mic + FAB) and `BootOS` (JARVIS OS).
- **Missing vs spec §18–§20:** no Jarvis Core (intent/context/memory/tool
  registry/reasoning), and the command schema has **no** `organizationId`,
  `actor`, `sessionId`, `deviceId`, `authorizationContext`, or
  `subscriptionContext`; no audit log; no usage metering; no rate limiting.

## 9. Multi-tenancy

- **NOT IMPLEMENTED.** No `organizationId` anywhere; no tenant context,
  middleware, query scoping, storage/cache isolation, or cross-tenant tests.

## 10. Subscriptions / entitlements / seats

- **NOT IMPLEMENTED.** No plans, limits, entitlement service, doctor seats,
  usage metering, or billing logic. The Invoices screen shows `sessions × 180
  SAR` from mock data — display only, unrelated to platform billing.
- **Hardcoded plan limits (7 / 14):** **none found in business logic.** The only
  `7`/`14` literals are clinical/seed data (a patient's `done: 14`, a pain series
  `[7,6,7]`) — not plan limits. So spec §33 "no hardcoded 7/14" is satisfied
  today *because subscriptions don't exist yet*; it must be preserved when they
  are built.

## 11. Cross-tenant risk

- Not applicable yet (no tenants, no backend, no shared datastore). Becomes the
  central risk the moment a backend + `organizationId` land — see
  `security-threat-model.md` and `multi-tenant-architecture.md`.

## 12. Secrets

- **Clean.** Secret scan over all tracked files found no API keys, tokens, JWTs,
  private keys, or service-role keys. Only `.env.example` (placeholders:
  `VITE_JARVIS_PROVIDER=mock`, empty `VITE_JARVIS_API_URL`). `.gitignore`
  excludes `.env` / `.env.*` while keeping `.env.example`.

## 13. Deployment setup

- **Minimal / client-only.** Vite dev + build scripts, `.env.example`, a `/api`
  concept only as a future proxy comment. No CI, no Docker, no server runtime, no
  queue/cache/storage, no health checks, no rollback plan. Deployment target
  would be a static host today; the SaaS backend does not exist to deploy.

## 14. Gap summary (current → target)

| Capability | Current | Target (spec) |
|---|---|---|
| Frontend clinic UI | ✅ Present (7 screens + Jarvis UI) | Keep, extend (entitlement-aware, plan UIs) |
| Router / deep links | ❌ state-based | Router + guarded routes |
| Backend / APIs | ❌ none | Modular monolith, stateless APIs, versioned |
| Database + migrations | ❌ none | Tenant-scoped schema, constraints, migrations |
| Multi-tenancy | ❌ none | `organizationId` everywhere, enforced server-side |
| Identity / auth | ❌ none | Passkeys/WebAuthn, device trust, closed system |
| RBAC | ❌ none (dev list only) | Deny-by-default roles + permissions |
| Subscriptions / seats | ❌ none | Config-driven plans, entitlement service, seats |
| Jarvis Core | ❌ external, not built | Independent service via Connector SDK |
| Jarvis command context | ⚠️ partial schema | Tenant + actor + device + subscription context |
| Audit / metering | ❌ none | Audit service, usage metering |
| 3D Anatomy | ⚠️ "coming soon" slot | Provider adapter + real engine |
| Tests / lint / CI | ❌ none | Full suite + deployment gate |

## 15. Reusable assets (do not rebuild)

The Nocturne design system, the 7 screens, the modal system, the Jarvis UI +
boot sequence, the i18n layer, the integration-boundary pattern
(`provider`/adapter/DI), the CDSS engine, and the design-preview harness are all
sound and should be **preserved and extended**, per the "no rebuild" rule.
