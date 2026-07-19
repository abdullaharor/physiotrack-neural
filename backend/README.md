# PhysioTrack Backend

Multi-tenant SaaS backend for the PhysioTrack physiotherapy platform.
**Fastify + Prisma + PostgreSQL + TypeScript (ESM, strict).**

> Built as production-grade source. It was authored in an environment without npm
> registry access or a running PostgreSQL, so it has NOT been compiled, migrated,
> or tested there. Run the steps below on a networked machine / in Blink to build,
> migrate, and test. Anything not finished is marked `NOT IMPLEMENTED`.

## Run

```bash
cd backend
npm install
cp .env.example .env          # set APP_SECRET + DATABASE_URL
npm run prisma:generate
npm run prisma:migrate        # creates the schema
npm run db:seed               # optional: platform owner + demo clinic
npm run dev                   # http://localhost:8080
```

Quality gates: `npm run typecheck` · `npm run lint` · `npm run test` · `npm run build`.

## Architecture

Modular monolith (see `../docs/adr/`). Security spine:
`tenant context → auth → RBAC (deny-by-default) → entitlement (seats/features) → audit`.
Every tenant-owned query is scoped by `organizationId` (never from the client),
with PostgreSQL RLS as a backstop. Jarvis is external: the Connector re-validates
every command; Jarvis never touches the DB directly.

## Status by module

| Module | Status |
|---|---|
| config / env, errors, ids, logger | implemented |
| Prisma schema (full tenant model) | implemented |
| tenant context + middleware | implemented |
| RBAC (roles + permissions, deny-by-default) | implemented |
| entitlement (plan catalog + seats + features) | implemented |
| auth (session + password Argon2; passkey scaffolded) | partial |
| organizations / provisioning | partial |
| doctors (seat-enforced create) | implemented |
| patients / appointments / sessions | partial (patients implemented) |
| audit | implemented |
| Jarvis connector / anatomy / devices | NOT IMPLEMENTED (Phase 5–8) |
| tests | starter suite (tenant isolation, seats) |

See `../docs/PROGRESS.md` for the live phase status.
