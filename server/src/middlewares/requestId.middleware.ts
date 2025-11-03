// src/middlewares/requestId.ts
import type { NextFunction, Request, Response } from "express";

export function requestId(req: Request, _res: Response, next: NextFunction) {
  // Réutilise un x-request-id entrant, sinon en génère un
  const existing = req.headers["x-request-id"] as string | undefined;
  const id =
    existing ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2));

  // Normalise sur req + header pour la suite (morgan + errorHandler)
  (req as any).traceId = id;
  req.headers["x-request-id"] = id;
  next();
}
