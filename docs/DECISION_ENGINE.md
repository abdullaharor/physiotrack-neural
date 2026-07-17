# Decision Engine

Before starting **any** task, classify it as exactly one of the categories
below, then state: **why**, **which tool** should be used, and **whether a
Claude Design export is required**. Do this out loud (in the response) before
touching code or design.

## Categories

| Category | Meaning | Tool | Claude Design export? |
|---|---|---|---|
| `DESIGN_REQUIRED` | Changes appearance/UX significantly; needs to be designed before any code. | Claude Design | Yes — design, approve, export, import. |
| `CODE_REQUIRED` | Pure engineering; no visual/UX change. | Claude Code | No. |
| `DESIGN_THEN_CODE` | Needs new/changed UI **and** implementation. | Claude Design → Claude Code | Yes — design & approve first, then implement against the imported reference. |
| `MINOR_CODE_FIX` | Small, low-risk code change with no UX impact (bug fix, refactor, copy tweak that isn't a redesign). | Claude Code | No. |
| `EXTERNAL_SERVICE_TASK` | Belongs to an external service (e.g. Jarvis Core) or another isolated repo. | Codex (isolated) | No — must not touch this production repo inline. |
| `CLARIFICATION_REQUIRED` | Scope/intent is ambiguous; a decision is needed before classifying. | — (ask first) | To be determined after clarification. |

## How to apply it

1. **Does it change how the product looks or feels significantly?**
   → `DESIGN_REQUIRED` (if purely visual) or `DESIGN_THEN_CODE` (if it also needs
   code). Design in Claude Design first.
2. **Is it purely technical with no UX change?**
   → `CODE_REQUIRED`, or `MINOR_CODE_FIX` if it is small and low-risk.
3. **Does it belong to Jarvis intelligence or another isolated effort?**
   → `EXTERNAL_SERVICE_TASK` (Codex, isolated — never inline in this repo).
4. **Is the intent unclear?**
   → `CLARIFICATION_REQUIRED` — ask before proceeding.

## Guardrails tied to classification

- A `DESIGN_REQUIRED` / `DESIGN_THEN_CODE` task must **not** be implemented in
  code until the design is approved and exported. Claude Code never invents or
  redesigns an approved interface.
- A `CODE_REQUIRED` / `MINOR_CODE_FIX` task must **not** silently change approved
  visuals. If implementation reveals a needed UX change, reclassify to
  `DESIGN_THEN_CODE` and return to Claude Design.
- An `EXTERNAL_SERVICE_TASK` must **not** edit this production repository while
  Claude Code is developing it.

## Worked examples

- *"Add a Receptionist role to the sidebar with its own dashboard layout"* →
  `DESIGN_THEN_CODE` (new screens/nav = design first; RBAC wiring = code after).
- *"Wire the Jarvis chat to the real Codex endpoint via config"* →
  `CODE_REQUIRED` (provider swap; no UI change). Export not required.
- *"The recovery % rounds wrong on the KPI card"* → `MINOR_CODE_FIX`.
- *"Build the clinical reasoning model for Jarvis"* → `EXTERNAL_SERVICE_TASK`
  (Codex; never inside PhysioTrack).
- *"Design the Integrations & Modules section"* → `DESIGN_REQUIRED` (Claude
  Design first; this is exactly current-priority work — see `ROADMAP.md`).
- *"Write the workflow docs into /docs"* → `CODE_REQUIRED` (repo docs; no export).
