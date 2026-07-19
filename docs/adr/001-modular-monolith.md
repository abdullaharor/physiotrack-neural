# ADR-001: Modular Monolith over Microservices (for current scale)

## Status
Accepted (Phase 1)

## Context
The platform must serve tens → thousands of clinics with strong module
boundaries, but the team/traffic do not yet justify many independently deployed
services (spec §9: "do not add many microservices early without need").

## Decision
Build a **modular monolith**: one deployable backend (`backend/`) composed of
well-bounded modules (identity, organization, subscription, entitlement, patient,
appointment, session, audit, connector, anatomy). Each module owns its data
access and exposes an internal service interface. No module reaches into another
module's tables directly.

## Consequences
- Fast to build, one deploy, simple local dev.
- Modules can later be extracted to services without rewrites (clean seams).
- Requires discipline: cross-module calls go through service interfaces only.
