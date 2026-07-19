# Subscription & Entitlement Plan (Phase 0 target)

**Status: NOT IMPLEMENTED.** No plans, limits, entitlement service, or seat logic
exist today. Confirmed: **no hardcoded `7`/`14` plan limits** in business logic
(the only such literals are clinical/seed data). This is the plan for Phase 4 —
and the "no hardcoded limits" property must be preserved.

## 1. Config-driven, never hardcoded

Forbidden pattern:

```ts
if (plan === "professional") { maxDoctors = 14; }   // ❌ never
```

All limits/features come from a stored **subscription configuration** and are
editable **without redeploying**. Plans are configuration, not code.

```json
{
  "subscriptionId": "…", "organizationId": "clinic-id",
  "planCode": "clinic-professional", "status": "active",
  "billing": { "currency": "SAR", "amount": 5000, "billingCycle": "contract-defined" },
  "limits": {
    "maxClinicOwners": 1, "maxDoctors": 14, "maxBranches": 2,
    "maxStorageGB": 100, "maxPatients": null,
    "maxAIRequestsPerMonth": 50000, "maxConcurrentJarvisRequests": 10,
    "maxTrustedDevicesPerDoctor": 3
  },
  "features": {
    "jarvis": true, "anatomy3D": true, "advancedAnalytics": true,
    "deviceIntegration": true, "customReports": true, "prioritySupport": true,
    "dedicatedDatabase": false, "dedicatedInfrastructure": false
  },
  "startsAt": "ISO-8601", "expiresAt": "ISO-8601", "gracePeriodEndsAt": null
}
```

## 2. Packages (commercial reference — values live in config)

| Plan | Price | Clinic Owners | Doctors | Branches | Notes |
|---|---|---|---|---|---|
| Clinic Starter | 2500 SAR | 1 | up to 7 | 1 default | patients, appts, sessions, basic reports, Jarvis, 3D; monthly usage + storage caps from config |
| Clinic Professional | 5000 SAR | 1 | up to 14 | config-defined | all core + higher Jarvis limits, more storage, advanced analytics, priority support, extra integrations |
| Enterprise Custom | contract | config | config | config | per-contract: doctors, owners, branches, clinics, patients, storage, Jarvis quota, device/EMR/HIS integration, dedicated DB/hosting/region, SLA, SSO, custom audit/compliance |

**Enterprise price is never hardcoded** — price, contract, and limits are set from
the admin platform.

## 3. Entitlement Service (independent)

Responsibilities: resolve available features per clinic, resolve usage limits,
verify the subscription, prevent plan overrun, support trials/add-ons/custom
features, upgrade/downgrade, grace period, suspension, temporary Platform-Owner
override, and **log every allow/deny decision**.

Every feature is checked from the **backend**:

```json
{ "organizationId": "clinic-id", "feature": "anatomy3D", "allowed": true, "source": "subscription", "limit": null }
```

Resource example (seats):

```json
{ "organizationId": "clinic-id", "resource": "doctor_seats", "used": 6, "limit": 7, "remaining": 1 }
```

## 4. Doctor seat management

On "create doctor": (1) verify subscription status → (2) verify doctor limit →
(3) count used seats → (4) block if at limit → (5) show the reason → (6) offer
upgrade → (7) log the attempt.

Seats counted: `pending_activation`, `active`, `suspended`. Not counted by
default: `revoked` — but make this **policy configurable**. The limit is enforced
on the backend and cannot be bypassed from the UI, the API, or Jarvis.

## 5. Lifecycle

`active` → `grace` (past due, `gracePeriodEndsAt`) → `suspended`. Suspended
behavior (grace vs read-only) is **config-driven**; paid features not entitled
are refused server-side.

## 6. Enforcement rules (§33)

- Every paid feature requires a **backend entitlement check** (hiding a button is
  not enforcement).
- No hardcoded tenant IDs, plan limits, or roles.
- Upgrade/downgrade changes behavior **without a deployment** (config only).
- All allow/deny decisions are audited.

## 7. Required subscription tests (§27)

Starter clinic with 7 doctors adding an 8th → rejected, no seat consumed, plan
limit shown, upgrade offered, attempt logged. Professional adding a 15th →
rejected. Enterprise limit 50 → allowed up to 50 **by config, no code change**.
Feature disabled (no 3D) → backend refuses + UI shows "not included" (button-hide
insufficient). Suspended subscription → grace/read-only per config.
