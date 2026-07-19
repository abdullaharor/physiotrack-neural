import argon2 from "argon2";

/**
 * Transitional password support (Argon2id). Passkeys/WebAuthn are the primary
 * factor (ADR-004); passwords, where enabled, use strong hashing + lockout
 * (enforced in session/login flow) and forced passkey enrollment later.
 */
const OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, OPTS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

const POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;
export function isStrongPassword(plain: string): boolean {
  return POLICY.test(plain);
}
