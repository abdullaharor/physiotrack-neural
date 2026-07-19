# ADR-003: Jarvis Core as an External Service via Connector SDK

## Status
Accepted (Phase 1)

## Context
Jarvis must remain an independent AI system, reusable by other hosts, never
embedded in the clinic app (spec §1, §18).

## Decision
The clinic backend exposes a **Connector API** (command receiver + capability
discovery + events). Jarvis Core runs as a separate service and calls in with a
**service account** that has **no standing privileges**. Every command is
**re-validated** by the backend (identity, tenant, status, device, role,
permission, subscription, feature, scope, schema, safety, rate limit). Jarvis
never touches the database directly.

## Consequences
- Jarvis is swappable and independently deployable.
- "A command exists" ≠ "authorized" — backend is the authority.
- All commands + authorization decisions are audited.
