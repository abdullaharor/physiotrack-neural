# Official Development Workflow

This is the permanent workflow for PhysioTrack. It is binding for every change.

## Ground rules

- This repository is the **production source of truth**.
- **Never** rebuild the application from scratch.
- **Never** create a parallel project.
- **Never** replace the repository with a Claude Design export. Exports are
  imported as an *approved visual reference* only.
- Implement **incrementally**, preserving Git history.

## Responsibilities

### 1. Claude Design — appearance & experience ONLY

Claude Design owns, and is the required starting point for, anything that changes
how the product looks or feels:

UI · UX · layout · motion · animations · visual hierarchy · navigation ·
responsive design · new screen concepts · empty/loading/error states · RTL/LTR
design · visual role previews.

> Whenever a feature **significantly** changes the appearance or user experience,
> it must be designed in Claude Design first.

After approval: `Export → Project Archive`, then import the archive into this
repository as the approved visual reference (it lives under `design-reference/`,
is read-only, and is never built or shipped directly).

### 2. Claude Code — engineering ONLY

Claude Code owns everything technical:

React · TypeScript · components · routing · state management · authentication ·
authorization · RBAC · APIs · database integration · providers · plugin
architecture · testing · build · deployment · Git.

> Claude Code must **never redesign an approved interface** unless explicitly
> requested.

### 3. Codex — isolated only

Codex must **not** modify this production repository while Claude Code is
developing it. Codex may be used only for:

- Jarvis Core (the external AI service)
- isolated experiments
- separate repositories
- code review
- feature branches that are completely isolated

## The pipeline

```
                significant UX/appearance change?
                              │
                 ┌────────────┴────────────┐
                yes                         no
                 │                          │
      Design in Claude Design       Claude Code implements
                 │                  directly (see Decision Engine)
            Approval
                 │
       Export → Project Archive
                 │
   Import archive → design-reference/ (approved visual reference)
                 │
         Claude Code implements incrementally against the reference
                 │
     Definition of Done gates: lint · type check · tests · production build
                 │
                 Commit (preserve Git history)
```

## Definition of Done (post-import, every change)

Before a change is considered complete, Claude Code runs and passes:

1. **Lint** — `npm run lint`
2. **Type check** — `npm run typecheck`
3. **Tests** — `npm run test`
4. **Production build** — `npm run build`

Then commit with a descriptive message. Never force-replace history; always
build on the existing commit graph. See `ROADMAP.md` for which of these scripts
already exist and which are groundwork still to be added.

## Importing a Claude Design archive (checklist)

1. Confirm the export is the **latest approved** version (compare against the
   previous archive; the content, not just the zip, must differ if changes were
   expected).
2. Place the raw export under `design-reference/` (reference only — never built).
3. Identify the **delta** vs the current implemented UI.
4. Implement the delta incrementally in `src/` — update existing components; do
   not rebuild screens that did not change.
5. Preserve all existing behavior, providers, routing, and state.
6. Run the Definition of Done gates, then commit.
