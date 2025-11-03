import { Router } from "express";
import { status, register, login, logout, refreshToken, me, forgotPassword, resetPasswordFromToken } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { loginSchema, refreshSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../dtos/auth.dto";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middlewares/auth.middleware";
const r = Router();

// Liaison du segment d'url avec la méthode de contrôleur à executer
r.get("/status", status);
r.post("/register", validate(registerSchema), asyncHandler(register));
r.post("/login", validate(loginSchema), asyncHandler(login));
r.post("/logout", validate(refreshSchema), asyncHandler(logout));
r.post("/refresh", validate(refreshSchema), asyncHandler(refreshToken));
r.get("/me", requireAuth, asyncHandler(me));

r.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);

r.post(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(resetPasswordFromToken)
);

export default r;

