# ADR-005: Config-Driven Subscriptions & Entitlements (no hardcoded limits)

## Status
Accepted (Phase 1)

## Context
Plan limits (e.g. 7/14 doctors) must never be hardcoded in business logic and
must change without redeploying (spec §5–§8, §33).

## Decision
A **plan catalog** (data/config) defines default limits/features per plan code.
Each organization's **Subscription** row stores its effective `limits` and
`features` (overridable per contract, esp. Enterprise). An **Entitlement
Service** is the single authority for "is this feature allowed?" and "is there a
free seat?" — enforced in the backend, audited, and adjustable via config/data,
not code.

## Consequences
- No `if (plan==='professional') maxDoctors=14` anywhere.
- Upgrades/downgrades and enterprise custom limits are config changes.
