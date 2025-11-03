import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { prisma } from "../db/postgres";

// 1️⃣ Erreur AppError contrôlée (403)
export const testForbidden = async (req: Request, res: Response) => {
  throw AppError.forbidden("Vous n'avez pas les droits !");
};

// 2️⃣ Erreur Zod (422)
// Simulée en lançant un ZodError minimal (mappée automatiquement)
export const testValidation = async (req: Request, res: Response) => {
  const zodError: any = {
    name: "ZodError",
    issues: [{ path: ["email"], message: "Email invalide", code: "invalid_type" }],
  };
  throw zodError;
};

// 3️⃣ Erreur Prisma Unique (409)
export const testPrismaUnique = async (req: Request, res: Response) => {
  await prisma.user.create({
    data: { email: "duplicate@test.dev", name: "test", password: "x" },
  });
  // Une 2e insertion créera un P2002
  await prisma.user.create({
    data: { email: "duplicate@test.dev", name: "test", password: "x" },
  });
};

// 4️⃣ JWT expiré (401)
export const testJwtExpired = async (req: Request, res: Response) => {
  const jwtError: any = { name: "TokenExpiredError", expiredAt: new Date() };
  throw jwtError;
};

// 5️⃣ SyntaxError JSON invalide (400)
// ✅ pas besoin de throw → BodyParser va déclencher l’erreur avant d’arriver ici
export const testJsonInvalid = async (req: Request, res: Response) => {
  res.json({ success: true });
};

// 6️⃣ Erreur inconnue (500)
export const testUnknown = async (req: Request, res: Response) => {
  throw new Error("Erreur serveur imprévue !!!");
};

// 7️⃣ Succès normal (200)
export const testOk = async (req: Request, res: Response) => {
  res.json({ message: "Tout va bien ✅" });
};
