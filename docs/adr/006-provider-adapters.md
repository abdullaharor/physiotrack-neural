# ADR-006: Provider/Adapter Pattern for Jarvis, Anatomy, Devices, Accounting

## Status
Accepted (Phase 1)

## Context
Optional capabilities must be replaceable plugins; the core works when any is
disabled (spec §23, PLUGIN ARCHITECTURE from earlier docs).

## Decision
Each optional capability is behind a **Provider interface** with DI selection and
Disabled/Mock/Real implementations, mirrored on the frontend
(`src/integrations/*`, already present) and backend (connector, anatomy, devices,
accounting modules).

## Consequences
- Swapping a provider is a config/DI change, no UI or core rewrite.
- Consistent contract: health, connection, test, enable/disable, logs.
