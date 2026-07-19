import { z } from "zod";

/** Zod-validated environment. Fails fast on boot if misconfigured. */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  HOST: z.string().default("0.0.0.0"),

  DATABASE_URL: z.string().min(1),

  SESSION_COOKIE_NAME: z.string().default("pt_session"),
  SESSION_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(14),
  APP_SECRET: z.string().min(32, "APP_SECRET must be at least 32 chars"),

  RP_ID: z.string().default("localhost"),
  RP_NAME: z.string().default("PhysioTrack"),
  RP_ORIGIN: z.string().default("http://localhost:5173"),

  JARVIS_CONNECTOR_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
  JARVIS_SERVICE_ACCOUNT_ID: z.string().optional(),
  JARVIS_ALLOWED_ORIGIN: z.string().optional(),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW: z.string().default("1 minute"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export const env = new Proxy({} as Env, {
  get(_t, prop: string) {
    return loadEnv()[prop as keyof Env];
  },
});
