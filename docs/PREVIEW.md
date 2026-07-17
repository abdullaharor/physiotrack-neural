# Design Preview & Claude Design Handoff

This document explains the development preview harness, lists the real screens,
maps the source files, and states clearly what can and cannot be done with
Claude Design.

## 1. Local preview command

```bash
npm install
npm run preview:design      # opens http://localhost:5173/preview.html
```

- `npm run preview:design` mounts the **real** `PhysioTrackApp` wrapped in the
  development harness (`src/dev/`). It uses the app's built-in mock data and mock
  providers, so **every screen renders with no backend services**.
- `npm run dev` runs the plain production app (no harness) at
  `http://localhost:5173/`.

The harness adds, in a floating **DEV** panel (bottom-left, never shipped):

- **Language** — العربية (RTL) ↔ English (LTR).
- **Role switcher** — the 7 target roles. Preview only: RBAC enforcement is not
  implemented yet, so this sets a display role and changes no behavior.
- **Module-state switcher** — enable/disable + provider for Jarvis, 3D Anatomy
  Atlas, Accounting, Medical Devices. Disabling a module hides its sidebar item
  (and, for Jarvis, the whole Jarvis UI) — a preview-only effect; production is
  unchanged. Providers marked `*` are not implemented yet and fall back to Mock.

Production is untouched: `src/main.tsx` renders `<PhysioTrackApp/>` with none of
the preview props (`showJarvis`, `hiddenNav` default to full behavior).

## 2. Exact folder containing the real UI source

```
physiotrack-platform/src/
```

Within it, the UI lives in **`src/app/`** (screens, sidebar, header, modals,
Jarvis UI) with styling in **`src/styles/`** and primitives in **`src/lib/`**.
The dev-only harness is isolated in **`src/dev/`**.

## 3. Real screens included (nothing invented)

The application has these real screens (state-based navigation via
`state.view` — there is **no router / no URLs**):

1. **Dashboard** — KPIs, active patients, CDSS insights, anatomy teaser
2. **Patients** — search + care-plan cards
3. **Appointments** — schedule table
4. **Invoices** — billing table
5. **Team** — clinic staff table
6. **3D Anatomy** — external-module slot ("coming soon")
7. **Devices** — medical-device plugin hub

Plus the **Jarvis UI** (floating chat panel + FAB + the "JARVIS OS" boot
sequence) and the **modal system** (patient profile, ROM/MMT assessment, report).

**Not built yet** (do NOT exist in code; pending Claude Design steps 1–6 in
`ROADMAP.md`): Login, Users & Access, Roles, Permissions, Integrations & Modules,
Accounting. These were intentionally **not** created or faked.

## 4. File map — what controls each area

| Area | File(s) | Status |
|---|---|---|
| Login | — | **Not built** (pending design) |
| Sidebar | `src/app/Sidebar.tsx` | Real |
| Dashboard | `src/app/screens/Dashboard.tsx` | Real |
| Users & Access | — | **Not built** (pending design) |
| Roles & Permissions | — | **Not built** (`src/dev/roles.ts` lists target roles for the preview switcher only) |
| Integrations & Modules | — | **No screen built.** Boundaries live in `src/integrations/` (contracts + providers + DI) |
| Jarvis UI | `src/app/jarvis/JarvisLayer.tsx`, `src/app/jarvis/BootOS.tsx` (+ `src/integrations/jarvis/*`) | Real |
| Anatomy Atlas UI | `src/app/screens/Anatomy.tsx` (+ `src/integrations/anatomy/*`) | Real (module slot) |
| Accounting UI | — | **Not built** (pending design; Invoices screen is the only billing-adjacent screen) |
| Medical Devices UI | `src/app/screens/Devices.tsx` (+ `src/integrations/devices/*`) | Real |
| Preview harness | `src/dev/*`, `src/preview.tsx`, `preview.html` | Dev-only |

## 5. ⚠️ Claude Design import — read this

**Claude Design cannot import this repository to edit it directly, and there is
no export format from this repo that Claude Design can re-import without losing
the code.**

Why:

- This repository is a standard **React + TypeScript + Vite** codebase.
- Claude Design's format is **dc-runtime** (`*.dc.html` with `<x-dc>` templates,
  `DCLogic` scripts, `support.js`, and a `_ds/` design system) — a different,
  one-way authoring format. It is produced by Claude Design and *imported into*
  code as a read-only reference; it is **not** a round-trip format for React/TS
  source.
- Uploading this repo (or a zip of it) into Claude Design would not give you an
  editable design, and any "export" would not reproduce the React components,
  state, providers, routing, or logic. **Code would be lost.**

The only Claude-Design-importable artifact in this repo is the original approved
design already stored under `design-reference/PhysioTrack v3.dc.html` — that is a
Claude Design file, and it represents the *existing approved visuals*, not the
current code.

### Supported handoff (the correct direction)

Per `WORKFLOW.md`, design flows **one way**:

```
Claude Design  ──(design & approve)──►  Export → Project Archive
      ▲                                          │
      │                                   import as read-only
   (edit here)                            reference into repo
                                                 │
                                                 ▼
                                  Claude Code implements in src/
```

So, to continue design work:

- **Do:** open/continue the PhysioTrack project **inside Claude Design** (or
  import `design-reference/PhysioTrack v3.dc.html` there), design the new
  screens/changes, get approval, then `Export → Project Archive` and hand that
  archive to Claude Code to implement in this repo.
- **Don't:** upload this repository into Claude Design expecting to edit the code
  — it won't round-trip, and code will be lost.

## Which file to "upload into Claude Design"

There is **no file in this repository** that you upload into Claude Design to
edit the app. If you want the current approved visuals as a starting point for
new design work, the Claude Design source is
`design-reference/PhysioTrack v3.dc.html` (the original v3 export). New designs
are then exported *from* Claude Design and imported *into* this repo — never the
reverse.
