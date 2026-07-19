import Fastify from "fastify";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { registerErrorHandler } from "./plugins/errorHandler.js";
import { authenticate } from "./plugins/context.js";
import { registerAuthRoutes } from "../modules/identity/authRoutes.js";
import { registerDoctorRoutes } from "../modules/identity/doctorRoutes.js";
import { registerOrganizationRoutes } from "../modules/organization/routes.js";
import { registerPatientRoutes } from "../modules/patient/routes.js";

export async function buildServer() {
  const app = Fastify({ logger, trustProxy: true, genReqId: () => crypto.randomUUID() });

  await app.register(helmet, { global: true });
  await app.register(cookie, { secret: env.APP_SECRET });
  // Per-clinic + per-IP rate limiting.
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    keyGenerator: (req) => {
      const orgId = req.actor?.organizationId;
      return orgId ? `org:${orgId}` : `ip:${req.ip}`;
    },
  });

  registerErrorHandler(app);

  // Authenticate (non-enforcing) on every request; routes enforce via authed().
  app.addHook("onRequest", authenticate);

  app.get("/health", async () => ({ status: "ok", ts: new Date().toISOString() }));
  app.get("/ready", async () => ({ status: "ready" }));

  await registerAuthRoutes(app);
  await registerDoctorRoutes(app);
  await registerOrganizationRoutes(app);
  await registerPatientRoutes(app);

  return app;
}

async function main() {
  const app = await buildServer();
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Run only when executed directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
