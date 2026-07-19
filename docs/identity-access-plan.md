# Identity & Access Plan (Phase 0 target)

**Status: NOT IMPLEMENTED.** The current app has no authentication, accounts, or
RBAC (see `current-state-audit.md`). This is the plan for Phase 3.

## 1. Closed system — no public entry

Forbidden entirely: public sign-up, self-registration, Google/Apple/social login,
creating a doctor from a public page, creating a Clinic Owner from inside the
doctor app, patient user accounts, demo accounts in production, default admin,
master password, backdoor, "secret URL" as a security control.

Correct provisioning chain (top-down only):

```
Platform Owner → creates clinic → provisions Clinic Owner
  → Clinic Owner activates an approved device → creates doctors
    → Doctor activates an approved device → uses the clinic app
```

## 2. Roles (deny-by-default)

- **Platform Owner** — owns the whole platform. Creates/suspends organizations,
  manages Clinic Owners, plans, subscriptions, releases/deployment approval,
  platform security logs, emergency security stop.
- **Clinic Owner** — one clinic only. Creates/suspends/revokes doctors within
  subscription limits, approves/revokes devices, manages clinic permissions and
  settings, reads clinic security logs, views subscription, requests upgrades.
- **Doctor** — works only within their clinic. Cannot create clinics/owners/other
  doctors, change plan, change own role, access another clinic, or reach owner
  consoles.
- **Jarvis Service Account** — no standing privileges; acts only within the
  current user/clinic/session/device/permissions/plan.

Permission sets (server-enforced, deny-by-default):

```
Doctor:        patients.read/create/update, appointments.read/manage,
               sessions.read/start/complete, anatomy.use, jarvis.use,
               clinicalSuggestions.review
Clinic Owner:  doctors.create/suspend/revoke, devices.approve/revoke,
               clinic.permissions.manage, clinic.securityLogs.read,
               clinic.settings.manage, subscription.view, subscription.upgrade.request
Platform Owner: organizations.create/suspend/manage, clinicOwners.create,
               subscriptions.manage, plans.manage, platform.securityLogs.read,
               deployment.approve, release.manage
```

## 3. Authentication

**Passkey / WebAuthn / FIDO2 first**, bound to **trusted devices**. Identity is
`organizationId + userId`, never username or email alone.

- **Platform Owner:** hardware-backed passkey / security key, trusted-device
  allowlist, encrypted one-time recovery codes, short session timeout,
  re-authentication for sensitive operations, full audit. **No** email login, no
  owner password in code, no public owner login page, no default owner account,
  no email-only recovery. The Platform Owner console is a **separate app** from
  the clinic application.
- **Clinic Owner:** clinic code + internal owner id + passkey/WebAuthn + trusted
  device (optional hardware key). Cannot touch platform settings, public plan
  pricing, other clinics, the Platform Owner, code, or deployment.
- **Doctor:** clinic code + internal Doctor ID + passkey/WebAuthn + trusted
  device (e.g. `RIYADH-PHYSIO` / `DR-1024` / passkey). Email not required.
  If a password is *temporarily* supported: Argon2id, rate limiting, account
  lockout, password policy, session monitoring, and forced passkey enrollment
  later.

## 4. Doctor provisioning (Clinic Owner only, within seats)

Flow: check subscription → check available seats → enter name (+ license # if
needed) → generate internal User ID → assign permissions → issue **single-use**
activation token with short expiry → deliver securely → register passkey →
approve device → revoke token → audit.

```json
{
  "userId": "internal-random-id",
  "organizationId": "clinic-id",
  "role": "doctor",
  "status": "pending_activation",
  "permissions": [],
  "trustedDevices": [],
  "createdBy": "clinic-owner-id",
  "createdAt": "ISO-8601",
  "activatedAt": null
}
```

Account states: `pending_activation`, `active`, `suspended`, `revoked`, `locked`.

## 5. Device trust

Every admin/clinical user acts from a trusted device authenticated with
**cryptographic credentials** (not fingerprint alone).

```json
{
  "deviceId": "random-id", "organizationId": "clinic-id", "userId": "user-id",
  "publicKey": "public-key", "name": "Doctor iPad", "operatingSystem": "iPadOS",
  "status": "trusted", "registeredAt": "ISO-8601", "lastUsedAt": "ISO-8601",
  "revokedAt": null
}
```

Device states: `pending`, `trusted`, `revoked`, `blocked`.

## 6. Sessions

Short-lived access tokens + rotating refresh tokens with **reuse detection**
(reuse ⇒ revoke the whole token family and terminate sessions). Session
revocation must be immediate and testable. Re-authentication for sensitive
actions.

## 7. Required identity tests (§27)

Public registration → rejected. Doctor-creates-doctor → 403. Role escalation
(doctor→owner) → rejected + audited. Platform-owner email login → route does not
exist. Activation-token reuse → rejected. Untrusted device → blocked or approval
flow. Refresh-token reuse → detected, family revoked, sessions ended.
