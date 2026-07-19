/**
 * Dev bootstrap seed. Creates the FIRST Platform Owner (the chicken-and-egg
 * bootstrap that provisioning otherwise requires). DEV ONLY — refuses to run in
 * production, and never creates demo clinic/doctor accounts in production.
 */
import { prisma } from "../src/db/prisma.js";
import { hashPassword } from "../src/auth/password.js";
import { ROLE_DEFAULTS } from "../src/rbac/permissions.js";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed refuses to run in production");
  }
  const password = process.env.SEED_OWNER_PASSWORD;
  if (!password) {
    throw new Error("Set SEED_OWNER_PASSWORD (dev) to bootstrap the platform owner");
  }

  const existing = await prisma.user.findFirst({ where: { role: "platform_owner" } });
  if (existing) {
    console.log("Platform owner already exists:", existing.id);
    return;
  }

  const owner = await prisma.user.create({
    data: {
      role: "platform_owner",
      status: "active",
      displayName: "Platform Owner",
      permissions: ROLE_DEFAULTS.platform_owner,
      activatedAt: new Date(),
    },
  });
  await prisma.passwordCredential.create({
    data: { userId: owner.id, argon2Hash: await hashPassword(password) },
  });

  console.log("Bootstrapped platform owner:", owner.id);
  console.log("Log in with { userId, password } then provision clinics via /platform/organizations.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
