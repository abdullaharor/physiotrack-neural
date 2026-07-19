/** Typed application errors mapped to HTTP + a stable error code. */
export type ErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation_error"
  | "rate_limited"
  | "entitlement_denied"
  | "seat_limit_reached"
  | "tenant_scope_violation"
  | "subscription_inactive"
  | "internal";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly details?: unknown;
  /** Safe to expose to the client? (deny reasons are, internal traces are not) */
  readonly expose: boolean;

  constructor(opts: {
    code: ErrorCode;
    httpStatus: number;
    message: string;
    details?: unknown;
    expose?: boolean;
  }) {
    super(opts.message);
    this.name = "AppError";
    this.code = opts.code;
    this.httpStatus = opts.httpStatus;
    this.details = opts.details;
    this.expose = opts.expose ?? true;
  }
}

export const Errors = {
  unauthorized: (msg = "Authentication required") =>
    new AppError({ code: "unauthorized", httpStatus: 401, message: msg }),
  forbidden: (msg = "Not permitted") =>
    new AppError({ code: "forbidden", httpStatus: 403, message: msg }),
  // Cross-tenant / missing resources return the SAME shape so existence
  // in another tenant is never revealed (see multi-tenant-architecture.md §3).
  notFound: (msg = "Resource not found") =>
    new AppError({ code: "not_found", httpStatus: 404, message: msg }),
  conflict: (msg = "Conflict") => new AppError({ code: "conflict", httpStatus: 409, message: msg }),
  validation: (details: unknown, msg = "Validation failed") =>
    new AppError({ code: "validation_error", httpStatus: 422, message: msg, details }),
  rateLimited: (msg = "Too many requests") =>
    new AppError({ code: "rate_limited", httpStatus: 429, message: msg }),
  entitlementDenied: (feature: string) =>
    new AppError({
      code: "entitlement_denied",
      httpStatus: 403,
      message: `Feature not included in your plan: ${feature}`,
      details: { feature },
    }),
  seatLimitReached: (resource: string, limit: number) =>
    new AppError({
      code: "seat_limit_reached",
      httpStatus: 403,
      message: `Plan limit reached for ${resource} (limit ${limit})`,
      details: { resource, limit, upgradeRequestAvailable: true },
    }),
  tenantScopeViolation: () =>
    // Deliberately reported to the client as a plain not-found.
    new AppError({ code: "not_found", httpStatus: 404, message: "Resource not found" }),
  subscriptionInactive: (status: string) =>
    new AppError({
      code: "subscription_inactive",
      httpStatus: 402,
      message: `Subscription is ${status}`,
      details: { status },
    }),
  internal: (msg = "Internal error") =>
    new AppError({ code: "internal", httpStatus: 500, message: msg, expose: false }),
};

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
