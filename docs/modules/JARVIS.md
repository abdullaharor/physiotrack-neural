# Module: Jarvis AI

**Jarvis is NOT part of the core application. Jarvis is an external AI service.**

Jarvis intelligence (clinical reasoning, exercise algorithms, the model) is
developed externally (Codex / a separate service) and must **never** be
implemented inside PhysioTrack.

## Implement inside PhysioTrack ONLY

- Jarvis **UI**
- Jarvis **chat**
- Jarvis **voice interface**
- Jarvis **provider** (the integration boundary)
- **Command receiver** (accepts structured commands proposed by Jarvis)
- **Confirmation dialog** (explicit clinician approval)
- **Permission checks** (RBAC — who may use Jarvis / approve its actions)
- **Audit logging** (every proposed command, approval/decline, and outcome)

> The final clinical decision always remains with the therapist. Jarvis may only
> *propose* changes to patient/clinical data; nothing mutates data without an
> explicit clinician confirmation.

## Required providers

- `DisabledJarvisProvider` — module off; chat/voice unavailable; core unaffected.
- `MockJarvisProvider` — preview/testing; context-grounded canned replies, **no**
  intelligence.
- `RemoteJarvisProvider` — connects the real external Jarvis via configuration
  (`endpoint` from env; auth token injected at call time; **no API keys in code**).

Swap example (no UI change):

```ts
setJarvisProvider(new RemoteJarvisProvider({ endpoint: process.env.JARVIS_API_URL }));
```

## Dedicated "Jarvis Integration" page

Lives inside Integrations & Modules. Shows/controls: enable/disable, active
provider selection (Disabled / Mock / Remote), endpoint configuration, health,
connection status, **Test Connection**, permission mapping (which roles may chat
/ approve commands), and **logs** (audit trail of commands + confirmations).

## Current status in the repo

Implemented today under `src/integrations/jarvis/`:
`types.ts` (JarvisProvider / JarvisChatAdapter / JarvisVoiceAdapter),
`MockJarvisProvider`, `RemoteJarvisProvider`, `provider.ts` (DI),
`commandSchema.ts` (structured commands), `confirmation.ts` (clinician gate,
fail-closed), `contextBridge.ts`, and `voice/BrowserVoiceAdapter.ts`. The chat UI
(`app/jarvis/JarvisLayer.tsx`) and the JARVIS OS boot (`app/jarvis/BootOS.tsx`)
are wired entirely through the provider.

**Groundwork still to add** (`CODE_REQUIRED`; the page visuals are
`DESIGN_REQUIRED`): `DisabledJarvisProvider`, enable/disable state, health &
connection status, `testConnection()`, per-module audit **logs**, RBAC permission
checks, and the Jarvis Integration page itself.
