# ADR-002: Shared-DB Multi-Tenancy with organizationId + Hybrid Dedicated Path

## Status
Accepted (Phase 1)

## Context
Every tenant (clinic) must be fully isolated; enterprise clients may need
dedicated infrastructure (spec §4, §10).

## Decision
Default: **shared PostgreSQL** with a mandatory `organizationId` on every
tenant-owned row, enforced server-side via a tenant context + a repository layer
that refuses un-scoped access, plus **PostgreSQL Row-Level Security (RLS)** as a
defense-in-depth backstop. A **Tenant Routing Layer** resolves each request to
shared or dedicated infrastructure, so a clinic can move to a dedicated
DB/region without an application rewrite.

## Consequences
- One codebase serves shared and dedicated tenants.
- Isolation is enforced at request-context, query, RLS, storage, cache, jobs.
- Client never supplies `organizationId`; it is derived from the session.
