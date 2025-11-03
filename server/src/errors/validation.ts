// src/errors/validation.ts
import { AppError } from "./AppError";

export function fieldError(field: string, message: string, code = "invalid") {
  return AppError.unprocessable("Validation error", {
    issues: [{ path: field, message, code }],
  });
}
