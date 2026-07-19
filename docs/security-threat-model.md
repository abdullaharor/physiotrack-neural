# Security & Threat Model (Phase 0)

Threat model for the target platform. Today's attack surface is small (a
static frontend with no auth, no backend, no data, no secrets — see
`current-state-audit.md`), but the moment a backend + patient data + tenants land,
the risks below become primary. Deny-by-default throughout.

## 1. Assets

Patient health data (PHI) · clinical reports · identities & credentials
(passkeys, device keys, recovery codes) · tenant boundaries · subscription
entitlements · audit logs · Jarvis command channel · secrets/keys.

## 2. Trust boundaries (attacker cannot cross without authorization)

Client↔Backend · App↔Jarvis Core · Tenant↔Tenant · Clinic↔Platform Owner. See
`system-architecture.md` §4.

## 3. Threats & controls (STRIDE-oriented)

| # | Threat | Control |
|---|---|---|
| T1 | **Cross-tenant access / IDOR** | Server-side `organizationId` scoping at every layer; ownership checks; identical response for not-found vs cross-tenant; audit on denial (`multi-tenant-architecture.md`). |
| T2 | **Broken auth** | Passkey/WebAuthn + device trust; no public signup; short sessions; refresh-token reuse detection; account lockout (`identity-access-plan.md`). |
| T3 | **Privilege escalation** | Deny-by-default RBAC; role changes are privileged + audited; doctor cannot create doctors/owners or change own role. |
| T4 | **Subscription bypass** | Backend entitlement checks; seats enforced server-side; no hardcoded limits; UI hiding is never the control. |
| T5 | **Jarvis abuse / privilege escalation via AI** | Command existing ≠ authorized; backend re-validates all 12 checks; Jarvis has no standing privileges; forbidden actions (create owner, change plan, raise limits, approve deploy, disable security, reach another tenant) rejected. |
| T6 | **Prompt injection** | Untrusted content (patient notes, web, tool output) is data, not instructions; Jarvis cannot self-escalate; every mutating command needs clinician confirmation + backend authz; tool allowlist. |
| T7 | **PHI exposure** | Encryption in transit + at rest; tenant-scoped storage/signed URLs; least-privilege queries; no PHI in logs/URLs/analytics. |
| T8 | **Secret leakage** | No secrets in code; env-injected; secret scanning in CI; rotation; `.env` git-ignored (currently clean). |
| T9 | **Device compromise** | Cryptographic device credentials; revoke/block states; re-auth for sensitive ops. |
| T10 | **DoS / cost abuse (AI)** | Per-clinic rate limits; AI usage metering + quotas; concurrency caps. |
| T11 | **Audit tampering** | Append-only audit log; sensitive actions + authz decisions recorded; tenant-scoped. |
| T12 | **Supply chain** | Dependency scanning; pinned versions; review of new deps. |

## 4. OWASP Top-10 mapping (target)

A01 Broken Access Control → T1/T3/T5. A02 Crypto Failures → T7/T8. A03 Injection
→ T6 + input validation/parameterized queries. A04 Insecure Design → this model +
ADRs. A05 Misconfiguration → deployment gate (`§28`). A07 Auth Failures → T2/T9.
A08 Integrity → T11/T12. A09 Logging → Audit service. A10 SSRF → Connector egress
allowlist.

## 5. Required security tests (§27 — must exist before deploy)

Public registration blocked · doctor-creates-doctor 403 · seat overrun (7/14/custom)
rejected · cross-tenant patient access denied (existence hidden) · cross-tenant
Jarvis command rejected · feature-disabled enforced server-side · suspended
subscription policy · activation-token reuse rejected · untrusted device blocked ·
role escalation rejected · platform-owner email login absent · refresh-token reuse
detected · Jarvis privilege escalation rejected.

## 6. Deployment security gate (§28)

Block release on any of: build/test/type/critical-lint failure · public signup ·
default admin · owner email login · hardcoded secret · cross-tenant access · IDOR
· role escalation · subscription-limit bypass · feature-flag bypass · device-
approval bypass · unprotected patient data · mock auth · debug mode · missing
migration · failed backup test · missing audit log · Jarvis permission bypass ·
any Critical/High issue · missing rollback plan · **hardcoded 7/14 in business
logic instead of config**.

## 7. Current posture (honest)

No auth, no PHI, no backend, no secrets committed. The dominant *current* risk is
simply that **none of the above controls exist yet** — so none may be assumed
present. They are built in Phases 2–3 (tenancy, identity) and 11 (security),
verified by the tests in §5 before any real patient data is stored.
