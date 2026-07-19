# ADR-004: Passkey/WebAuthn-first, Closed Identity (no public signup)

## Status
Accepted (Phase 1)

## Context
Only Owners and Doctors have accounts; patients never log in. No public
registration, no social login, no default admin (spec §11–§16, USER MODEL).

## Decision
Identity is `organizationId + userId`. Authentication is **passkey/WebAuthn**
bound to **trusted devices**, provisioned top-down (Platform Owner → Clinic Owner
→ Doctor) via **single-use activation tokens**. A password path may exist
transitionally with **Argon2id** + lockout + forced passkey enrollment. Sessions
use opaque tokens (hashed at rest) with refresh-token reuse detection.

## Consequences
- No public entry points; provisioning is the only account-creation path.
- Platform Owner console is separate from the clinic app.
