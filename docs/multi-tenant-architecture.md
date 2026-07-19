# Multi-Tenant Architecture (Phase 0 target)

**Status: NOT IMPLEMENTED.** The current app has no tenant model, no
`organizationId`, and no backend to enforce isolation. This document defines how
multi-tenancy must be built (Phase 2), before any patient data is persisted.

## 1. Tenant model

The tenant is the **Clinic (Organization)**. Hierarchy:

```
Platform Owner
└── Organization (Clinic)  ── organizationId
    ├── Clinic Owner
    ├── Doctor(s)
    ├── Branch(es)
    └── Patients / Appointments / Sessions / Reports / Devices / …
```

Every tenant-owned record carries `{ "organizationId": "clinic-id" }`. This
applies to: users, patients, appointments, sessions, reports, files, treatment
plans, Jarvis commands, audit logs, devices, subscriptions, branches,
integrations.

## 2. Isolation is enforced server-side, at every layer

A UI filter is **not** security. A user from Clinic A crafting a raw request for
Clinic B data must be **rejected by the server**. Enforcement points:

1. **Backend / request context** — every request resolves a `TenantContext`
   `{ organizationId, userId, role, sessionId, deviceId }` from the authenticated
   session; handlers never accept `organizationId` from the client body.
2. **Database queries** — every query is scoped by `organizationId`. Prefer a
   mandatory scoping layer (e.g. row-level security or a repository that refuses
   un-scoped reads/writes), not ad-hoc `where` clauses.
3. **Authorization policies** — deny-by-default; resource ownership is checked
   (does this record's `organizationId` match the caller's?).
4. **Storage paths** — object keys are prefixed `org/{organizationId}/…`; signed
   URLs are tenant-scoped and time-limited.
5. **Search indexes** — every document indexed with `organizationId`; every query
   filtered by it (no cross-tenant index leakage).
6. **Background jobs** — jobs carry `organizationId` in their payload and run with
   that tenant context; workers never process cross-tenant batches.
7. **Cache keys** — all keys are tenant-namespaced (`{organizationId}:…`).
8. **Analytics** — aggregation is per-tenant; platform-wide analytics run only in
   the Platform Owner domain.

## 3. IDOR / cross-tenant defense

Object references (patientId, sessionId, …) are validated against the caller's
`organizationId` on **every** access. Non-existence and cross-tenant access
return the **same** response (do not reveal that a record exists in another
tenant). Every denied cross-tenant attempt emits an audit event.

## 4. Hybrid infrastructure

Default: **shared** multi-tenant (shared app, services, DB with strict
`organizationId` isolation, shared storage with separate paths, shared queue with
tenant context, horizontal scaling).

Enterprise: **dedicated** (own DB, storage, encryption keys, server resources,
region, dedicated Jarvis capacity, extra network controls).

A **Tenant Routing Layer** resolves each request to the right infrastructure
(shared vs dedicated) so a clinic can move from shared → dedicated **without an
app rebuild**. The application code must never assume a single shared database.

## 5. Required isolation tests (Phase 2 + §27)

- Cross-tenant patient access → **denied**, record existence **not revealed**,
  audit event emitted.
- Cross-tenant search → no results from other tenants.
- Cross-tenant file access → signed URL / path denied.
- Cross-tenant cache leakage → keys namespaced; no bleed.
- Cross-tenant background job → job refuses foreign `organizationId`.
- Cross-tenant Jarvis command → backend rejects a command whose target tenant ≠
  actor's tenant.
- IDOR sweep across all resource endpoints.

## 6. Data model note

`organizationId` should be a **non-null foreign key** with a database constraint
on every tenant table, and part of composite indexes used by hot queries. It is
set from the server-side tenant context at write time — never trusted from the
client.
