import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError, Errors, isAppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";

/** Uniform error envelope. Internal details are never leaked to clients. */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((err: unknown, req: FastifyRequest, reply: FastifyReply) => {
    let appErr: AppError;
    if (isAppError(err)) {
      appErr = err;
    } else if (err instanceof ZodError) {
      appErr = Errors.validation(err.issues);
    } else {
      logger.error({ err, reqId: req.id }, "unhandled error");
      appErr = Errors.internal();
    }
    const body: Record<string, unknown> = {
      error: { code: appErr.code, message: appErr.expose ? appErr.message : "Internal error" },
    };
    if (appErr.expose && appErr.details !== undefined) {
      (body.error as Record<string, unknown>).details = appErr.details;
    }
    reply.status(appErr.httpStatus).send(body);
  });

  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({ error: { code: "not_found", message: "Resource not found" } });
  });
}
