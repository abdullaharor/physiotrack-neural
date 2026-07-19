import pino from "pino";
import { env } from "../config/env.js";

/** Centralized structured logger. PHI must never be logged. */
export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token", "*.publicKey"],
    remove: true,
  },
});
