import type { NextFunction, Request, Response } from "express";

/** ✅ Wrapper pour handlers async → forward des erreurs à errorHandler */
export const asyncHandler =
  <T = any>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
