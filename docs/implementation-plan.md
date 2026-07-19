# Implementation Plan (Phase 0 output)

Sequenced plan to build the Jarvis Physiotherapy SaaS platform **under** the
existing UI, without a rebuild. Grounded in `current-state-audit.md`.

## 1. Reality check that shapes the plan

The repo is a **frontend-only** app. There is **no backend, database, auth,
tenancy, or subscription system** to extend — those must be **created**, then the
existing UI is wired to them. So the early phases are net-new backend work, not
edits to existing files. The UI, design system, Jarvis UI, and integration-
boundary pattern are preserved and become the client of the new platform.

## 2. Phase roadmap (from the master spec)

| Phase | Focus | Depends on |
|---|---|---|
| **0** | Current audit + these docs (**this deliverable**) | — |
| 1 | Architecture foundation: service boundaries, tenant model, Jarvis boundaries, API contracts, ADRs, trust boundaries | 0 |
| 2 | Multi-tenant foundation: organizations, tenant context + middleware, query/storage/cache scoping, isolation tests | 1 |
| 3 | Identity & access: Platform/Clinic owners, doctors, passkeys/WebAuthn, device trust, sessions, permissions, audit | 2 |
| 4 | Subscription & entitlements: plans, limits, features, doctor seats, metering, upgrade/downgrade, enterprise custom, grace | 2,3 |
| 5 | Jarvis Core (external): intent, context, commands, tools, safety, tenant + subscription context, audit | 1,3,4 |
| 6 | Connector SDK: auth, commands, events, retry, timeout, health check, capability discovery | 5 |
| 7 | Clinic app integration: dashboard, patients, appointments, sessions, Jarvis panel, usage/plan-limit UI | 2–6 |
| 8 | Anatomy adapter: provider interface, layers, search, highlight, gender, Jarvis commands | 1,7 |
| 9 | Clinical knowledge: sources, retrieval, citations, confidence, safety, approval | 5 |
| 10 | Voice & Saudi Arabic: STT/TTS `ar-SA`, Saudi style, mic-failure + text fallback | 5,7 |
| 11 | Security & privacy: encryption, secrets, rate limits, prompt injection, audit, patient privacy, tenant security | all |
| 12 | Scaling & reliability: stateless APIs, queue, caching, load tests, AI limits, storage, observability, hybrid infra | all |
| 13 | Full testing: unit, integration, E2E, security, tenant isolation, subscription, perf, a11y, RTL, recovery | all |
| 14 | Final verification: full build/tests/security, deployment config, rollback, independent verification | all |

## 3. Mandatory review workflow (§25) — applied every feature

1. Orchestrator defines the task → 2. Architecture Agent sets boundaries →
3. Multi-Tenant Agent reviews tenant impact → 4. Subscription Agent reviews plan
impact → 5. Implementation writes code → 6. runs task tests → 7. Senior Engineer
reviews the diff → 8. author fixes → 9. Senior Engineer re-reviews → 10. Testing
Agent runs tests → 11. Security Agent reviews → 12. IAM Agent (if identity) →
13. Database Agent (if data) → 14. Independent Verification reviews the whole
system → 15. Orchestrator accepts/rejects.

**The author of a change is never its final reviewer.** In this single-operator
setting these "agents" are review *lenses* applied in sequence (and, where useful,
by separate review sub-agents), not a claim that 17 autonomous bots ran.

## 4. Continuous checkpoints (§26)

Architecture · Identity · Tenant Isolation · Subscription · Jarvis ·
Pre-Deployment — each with the pass criteria in the spec. A phase is not "done"
until its checkpoint passes and its Phase Report (format in §31) is filed.

## 5. Definition of Done / deployment gate

Per `security-threat-model.md` §6 and the master §28/§29: build · lint · type
check · unit/integration/E2E · security · tenant-isolation · subscription-limit ·
database/migrations · secrets scan · rollback plan — all green, plus the required
human/lens approvals and Platform Owner approval. **Tooling gaps to close first
(Phase 1):** add ESLint (`lint` script) and a test runner (Vitest) — neither
exists today.

## 6. Guardrails carried into every phase (§33)

No rebuild; preserve the design; no mock data as final; no dead buttons; no
hardcoded tenant IDs / plan limits / roles; no secrets in code; UI is not
security; no query without tenant context; Jarvis never bypasses the backend or
reads the DB directly; no "done" without tests; interfaces/adapters/schemas;
DB constraints + transactions for sensitive ops; audit sensitive changes;
backend entitlement check for every paid feature; label anything incomplete as
**NOT IMPLEMENTED**.

## 7. Immediate next step

Await approval of these Phase 0 documents. **Do not modify code** until they are
accepted. On approval, begin **Phase 1 (Architecture Foundation)** starting with
ADR-001…006 and the API/tenant contracts — still before writing feature code.
