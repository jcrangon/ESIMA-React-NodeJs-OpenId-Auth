// src/middlewares/notFound.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound("Route not found"));
}
