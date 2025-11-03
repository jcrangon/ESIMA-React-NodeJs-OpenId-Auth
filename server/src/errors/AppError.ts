// src/errors/AppError.ts
export type ErrorDetails = Record<string, unknown> | undefined;

export class AppError extends Error {
  status: number;
  code: string;
  details?: ErrorDetails;
  expose: boolean;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      details?: ErrorDetails;
      expose?: boolean; // si true → message renvoyé tel quel au client
      cause?: unknown;
    }
  ) {
    super(message);
    this.name = "AppError";
    this.status = options?.status ?? 500;
    this.code = options?.code ?? "INTERNAL_ERROR";
    this.details = options?.details;
    this.expose = options?.expose ?? this.status < 500;
    if (options?.cause) (this as any).cause = options.cause; // Node >=16
    Error.captureStackTrace?.(this, AppError);
  }

  // HTTP courants
  static badRequest(message = "Bad request", details?: ErrorDetails) {
    return new AppError(message, { status: 400, code: "BAD_REQUEST", details, expose: true });
  }
  static unauthorized(message = "Unauthorized", details?: ErrorDetails) {
    return new AppError(message, { status: 401, code: "UNAUTHORIZED", details, expose: true });
  }
  static forbidden(message = "Forbidden", details?: ErrorDetails) {
    return new AppError(message, { status: 403, code: "FORBIDDEN", details, expose: true });
  }
  static notFound(message = "Not found", details?: ErrorDetails) {
    return new AppError(message, { status: 404, code: "NOT_FOUND", details, expose: true });
  }
  static conflict(message = "Conflict", details?: ErrorDetails) {
    return new AppError(message, { status: 409, code: "CONFLICT", details, expose: true });
  }
  static unprocessable(message = "Unprocessable entity", details?: ErrorDetails) {
    return new AppError(message, { status: 422, code: "UNPROCESSABLE", details, expose: true });
  }
  static tooManyRequests(message = "Too many requests", details?: ErrorDetails) {
    return new AppError(message, { status: 429, code: "RATE_LIMITED", details, expose: true });
  }
  static serviceUnavailable(message = "Service unavailable", details?: ErrorDetails) {
    return new AppError(message, { status: 503, code: "SERVICE_UNAVAILABLE", details });
  }

  // Aides pour libs externes
  static fromZodError(err: unknown) {
    const any = err as any;
    const issues = Array.isArray(any?.issues) ? any.issues : undefined;
    if (!issues) return AppError.unprocessable("Validation error");
    const details = {
      issues: issues.map((i: any) => ({
        path: Array.isArray(i.path) ? i.path.join(".") : String(i.path ?? ""),
        message: i.message,
        code: i.code,
      })),
    };
    return AppError.unprocessable("Validation error", details);
  }

  static fromPrisma(err: unknown) {
    const any = err as any;
    // P2002: contrainte d'unicité
    if (any?.code === "P2002") {
      const target = any?.meta?.target as string[] | undefined;
      return AppError.conflict("Unique constraint violation", { target });
    }
    // Autres erreurs connues : adapter si besoin
    return new AppError("Database error", { status: 500, code: "DB_ERROR", cause: err });
  }

  static fromJwt(err: unknown) {
    const name = (err as any)?.name;
    if (name === "TokenExpiredError") {
      return new AppError("Token expired", { status: 401, code: "TOKEN_EXPIRED", expose: true });
    }
    if (name === "JsonWebTokenError") {
      return new AppError("Invalid token", { status: 401, code: "TOKEN_INVALID", expose: true });
    }
    return new AppError("Auth error", { status: 401, code: "AUTH_ERROR" });
  }
}

/// ============================================================================
/// 📘 Résumé pédagogique — `AppError` (version étendue)
/// - Standardise erreurs HTTP + codes internes.
/// - `fromZodError/fromPrisma/fromJwt` mappent proprement les libs.
/// - Méthodes utilitaires (422, 429, 503) prêtes pour API modernes.
/// - `expose` contrôle ce qui est montré côté client.
/// ============================================================================
