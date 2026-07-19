import { z } from "zod";

/**
 * Structured Jarvis command (spec §19). Every command carries tenant + actor +
 * authorization + subscription context. The backend RE-VALIDATES all of it — a
 * command existing does not mean it is authorized.
 */
export const jarvisCommandSchema = z.object({
  commandId: z.string().uuid(),
  version: z.literal("1.0"),
  source: z.literal("jarvis"),
  target: z.literal("physiotherapy-app"),
  organizationId: z.string().min(1),
  actor: z.object({
    userId: z.string().min(1),
    role: z.string().min(1),
    sessionId: z.string().min(1),
    deviceId: z.string().nullable().optional(),
  }),
  action: z.string().min(1),
  parameters: z.record(z.unknown()).default({}),
  authorizationContext: z.object({ requiredPermission: z.string().optional() }).default({}),
  subscriptionContext: z.object({ requiredFeature: z.string().optional() }).default({}),
  requiresConfirmation: z.boolean().default(false),
  createdAt: z.string(),
});

export type JarvisCommand = z.infer<typeof jarvisCommandSchema>;
