import { randomUUID, randomBytes, createHash } from "node:crypto";

/** Opaque random id (for non-DB identifiers; DB uses cuid via Prisma). */
export function newId(): string {
  return randomUUID();
}

/** A high-entropy secret token (returned to the client once). */
export function newSecretToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Store only the hash of a token/secret. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time-ish compare of two hex hashes. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
