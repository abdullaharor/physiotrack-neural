import { prisma } from "../db/prisma.js";
import { newSecretToken, hashToken } from "../lib/ids.js";
import { Errors } from "../lib/errors.js";

const ACTIVATION_TTL_MINUTES = 30;

export interface IssuedActivation {
  activationToken: string; // delivered securely, once
  expiresAt: Date;
}

/** Issue a single-use activation token for a pending user (provisioning). */
export async function issueActivationToken(userId: string, createdById: string): Promise<IssuedActivation> {
  const token = newSecretToken();
  const expiresAt = new Date(Date.now() + ACTIVATION_TTL_MINUTES * 60_000);
  await prisma.activationToken.create({
    data: { userId, tokenHash: hashToken(token), expiresAt, createdById },
  });
  return { activationToken: token, expiresAt };
}

/**
 * Consume an activation token: valid, unexpired, unused → mark used and return
 * the userId. Reuse or expiry → rejected. Wrapped in a transaction to prevent
 * double-consumption races.
 */
export async function consumeActivationToken(token: string): Promise<{ userId: string }> {
  const tokenHash = hashToken(token);
  return prisma.$transaction(async (tx) => {
    const row = await tx.activationToken.findUnique({ where: { tokenHash } });
    if (!row) throw Errors.unauthorized("Invalid activation token");
    if (row.usedAt) throw Errors.unauthorized("Activation token already used");
    if (row.expiresAt.getTime() < Date.now()) throw Errors.unauthorized("Activation token expired");
    await tx.activationToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    return { userId: row.userId };
  });
}
