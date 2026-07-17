# PhysioTrack — Development Docs

This `/docs` folder is the **permanent, authoritative** description of how the
PhysioTrack repository is developed. It exists so the project follows one
consistent workflow regardless of who (or which tool) is working on it.

**This repository is the production source of truth.** Do not rebuild the
application, do not create a parallel project, and do not replace the repository
with a Claude Design export. Claude Design exports are imported as an *approved
visual reference*, never as a replacement.

## Read these in order

1. [`WORKFLOW.md`](./WORKFLOW.md) — the official development workflow: what
   Claude Design, Claude Code and Codex are each (only) responsible for, and the
   design → export → import → implement pipeline.
2. [`DECISION_ENGINE.md`](./DECISION_ENGINE.md) — how every task is classified
   before work starts, and what each classification implies.
3. [`PLUGIN_ARCHITECTURE.md`](./PLUGIN_ARCHITECTURE.md) — the module/plugin
   contract every optional capability must satisfy.
4. [`INTEGRATIONS_AND_MODULES.md`](./INTEGRATIONS_AND_MODULES.md) — the premium
   Integrations & Modules section and each module card.
5. [`RBAC.md`](./RBAC.md) — roles and role-based access.
6. Per-module specs in [`modules/`](./modules): Jarvis, 3D Anatomy Atlas,
   Accounting, Medical Devices.
7. [`ROADMAP.md`](./ROADMAP.md) — current priority, current-vs-target gap
   analysis, and the Definition of Done gates.

## The one-paragraph version

Significant appearance/UX changes are designed in **Claude Design first**, then
approved, then `Export → Project Archive`, then imported into this repo as the
visual reference. **Claude Code** implements everything technical (React, TS,
routing, state, auth, RBAC, APIs, providers, plugins, tests, build, deploy, git)
and never redesigns an approved interface unless explicitly asked. **Codex** may
build only Jarvis Core, isolated experiments, separate repos, code review, or
fully isolated feature branches — never editing this production repo while Claude
Code is developing it. Every capability that is optional (Jarvis, Anatomy,
Accounting, Medical Devices) is a **replaceable plugin**, and the core clinic app
keeps working when any of them is disabled.
