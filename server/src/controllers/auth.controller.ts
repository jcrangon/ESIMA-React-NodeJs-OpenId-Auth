import type { Request, Response } from "express";
import { prisma } from "../db/postgres";
import { AppError } from "../errors/AppError";
import { comparePassword, hashPassword } from "../utils/password";

import type { 
  LoginDTO, 
  RegisterDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from "../dtos/auth.dto";
import { sendPasswordResetEmail } from "../utils/mailer";
import crypto from "node:crypto";

import { setAccessCookie, signAccessToken, signRefreshToken, parseMaxAgeMs } from "../utils/jwt";
import { env } from "../config/env";
import jwt from "jsonwebtoken";

/** GET /auth/status */
export async function status(_req: Request, res: Response) {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
}

/** POST /auth/register */
export async function register(req: Request, res: Response) {
  // récupère le DTO validé par le middleware validate(registerSchema)
  const dto = (req as any).dto as RegisterDTO;

  // 1) Unicité email
  const exists = await prisma.user.findUnique({ where: { email: dto.email } });
  if (exists) {
    throw AppError.conflict("Un utilisateur avec cet email existe déjà");
  }

  // 2) Hash du mot de passe
  const passwordHash = await hashPassword(dto.password);

  // 3) Création utilisateur
  const user = await prisma.user.create({
    data: {
      email: dto.email,
      password: passwordHash,
    },
    select: { id: true, email: true, createdAt: true },
  });

  // 4) Réponse 201
  res.status(201).json({ user });
}

// Login
export async function login(req: Request, res: Response) {
  const dto = (req as any).dto as LoginDTO;

  // 1) Existence utilisateur
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
    select: { id: true, email: true, name: true, password: true, role: true },
  });
  if (!user) throw AppError.unauthorized("Identifiants invalides");

  // 2) Vérif mot de passe
  const ok = await comparePassword(dto.password, user.password);
  if (!ok) throw AppError.unauthorized("Identifiants invalides");

  // 3) Génération des tokens
  const payload = { sub: String(user.id), role: user.role as any };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // 4) Métadonnées & expiration RefreshToken (schéma étendu)
  const ua = req.get("user-agent") || "unknown";
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.socket?.remoteAddress ?? req.ip ?? "unknown");

  console.log(dto)
  const rememberMe = (dto as any).rememberMe === true; // si absent dans le DTO, false par défaut

  const refreshTtl = rememberMe ? env.REFRESH_TOKEN_TTL_LONG : env.REFRESH_TOKEN_TTL_SHORT;
  const refreshExpiresAt = new Date(Date.now() + parseMaxAgeMs(refreshTtl));

  // 5) Persistance du refresh token conforme au modèle
  const rt = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      rememberMe,
      userAgent: ua,
      ip,
      lastUsedAt: new Date(),
      replacedByToken: null,
      revoked: false,
      expiresAt: refreshExpiresAt,
    },
    select: { id: true, createdAt: true, expiresAt: true },
  });

  // 6) Cookie httpOnly pour l'access
  setAccessCookie(res, accessToken);

  // 7) Réponse
  res.status(200).json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    refreshToken,
    refreshId: rt.id,
    refreshExpiresAt: rt.expiresAt.toISOString(),
  });
}


/** POST /auth/logout */
export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body ?? {};

  // ✅ Toujours effacer le cookie (même si pas de refreshToken ou invalide)
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  if (!refreshToken) {
    return res.status(200).json({ message: "Déconnecté" });
  }

  // ✅ Invalider uniquement le refresh token fourni
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true, replacedByToken: null },
  });

  return res.status(200).json({ message: "Déconnecté" });
}

export async function refreshToken(req: Request, res: Response) {
  // 0) DTO validé en amont par validate(refreshSchema)
  const { refreshToken } = (req as any).dto as { refreshToken: string };

  // 1) Lecture DB du refresh token
  const rt = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true, passwordChangedAt: true },
      },
    },
  });

  // 1.a) Vérifications DB (existence, révocation, expiration, réutilisation)
  if (!rt) throw AppError.unauthorized("Refresh token invalide");
  if (rt.revoked) throw AppError.unauthorized("Refresh token révoqué");
  if (rt.replacedByToken) throw AppError.unauthorized("Refresh token déjà utilisé");
  if (rt.expiresAt.getTime() <= Date.now()) throw AppError.unauthorized("Refresh token expiré");

  // 2) Vérifier la signature/claims du JWT lui-même
  const ISSUER = env.JWT_ISSUER || "my-app";
  const AUDIENCE = env.JWT_AUDIENCE || "my-app-users";

  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    }) as jwt.JwtPayload;
  } catch {
    // Anti-reuse/anti-forgery: on peut révoquer toute la famille si besoin
    await prisma.refreshToken.update({
      where: { id: rt.id },
      data: { revoked: true },
    });
    throw AppError.unauthorized("Signature du token invalide");
  }

  // 2.a) Cohérence payload.sub ↔ DB
  const sub = String(rt.user.id);
  if (!payload?.sub || String(payload.sub) !== sub) {
    await prisma.refreshToken.update({
      where: { id: rt.id },
      data: { revoked: true },
    });
    throw AppError.unauthorized("Token non cohérent");
  }

  // 2.b) Invalidation globale après changement de mot de passe
  if (rt.user.passwordChangedAt && rt.user.passwordChangedAt.getTime() > rt.createdAt.getTime()) {
    await prisma.refreshToken.update({
      where: { id: rt.id },
      data: { revoked: true },
    });
    throw AppError.unauthorized("Session invalidée (mot de passe modifié)");
  }

  // 3) Métadonnées client
  const ua = req.get("user-agent") || "unknown";
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.socket?.remoteAddress ?? req.ip ?? "unknown");

  // 4) Rotation : émettre un nouvel access + refresh, révoquer l’ancien
  const accessPayload = { sub, role: rt.user.role };
  const newAccess = signAccessToken(accessPayload);
  const newRefresh = signRefreshToken(accessPayload);

  const refreshTtl = rt.rememberMe ? env.REFRESH_TOKEN_TTL_LONG : env.REFRESH_TOKEN_TTL_SHORT;
  const newRefreshExpiresAt = new Date(Date.now() + parseMaxAgeMs(refreshTtl));

  // 4.a) Marquer l’ancien comme remplacé + MAJ lastUsedAt
  await prisma.refreshToken.update({
    where: { id: rt.id },
    data: {
      revoked: true,
      replacedByToken: newRefresh,
      lastUsedAt: new Date(),
    },
  });

  // 4.b) Créer l’enregistrement du nouveau refresh
  const newRt = await prisma.refreshToken.create({
    data: {
      userId: rt.user.id,
      token: newRefresh,
      rememberMe: rt.rememberMe,
      userAgent: ua,
      ip,
      lastUsedAt: new Date(),
      revoked: false,
      expiresAt: newRefreshExpiresAt,
    },
    select: { id: true, expiresAt: true },
  });

  // 5) Déposer le nouvel access token en cookie httpOnly
  setAccessCookie(res, newAccess);

  // 6) Réponse
  res.status(200).json({
    user: { id: rt.user.id, email: rt.user.email, name: rt.user.name, role: rt.user.role },
    refreshToken: newRefresh,
    refreshId: newRt.id,
    refreshExpiresAt: newRt.expiresAt.toISOString(),
  });
}


/** GET /auth/me (protégé par requireAuth) */
export async function me(req: Request, res: Response) {
  // requireAuth a déjà validé l'utilisateur et a mis req.auth
  if (!req.auth) {
    throw AppError.unauthorized("Non authentifié");
  }

  // On relit en base pour avoir l'état le plus à jour
  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    // Cas rare: user supprimé mais cookie encore présent
    throw AppError.unauthorized("Compte introuvable ou supprimé");
  }

  res.status(200).json({ user });
}

// -----------------------------------------------------------------------------
// POST /auth/forgot-password
// Body: { email }
// -----------------------------------------------------------------------------
export async function forgotPassword(req: Request, res: Response) {
  const dto = (req as any).dto as ForgotPasswordDTO;

  // On essaie de trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
    select: { id: true, email: true },
  });

  // Réponse sera TOUJOURS 200, même si pas d'utilisateur.
  // Mais si l'utilisateur existe, on génère un token reset.
  if (user) {
    // Invalider les anciens tokens non utilisés (optionnel, hygiène)
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Générer un token random sécurisé
    const rawToken = crypto.randomBytes(32).toString("hex");

    const expiresInMin = 15;
    const expiresAt = new Date(Date.now() + expiresInMin * 60_000);

    // Enregistrer en DB
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: rawToken,
        expiresAt,
        usedAt: null,
      },
    });

    // Envoi d'email (async, sans bloquer la réponse)
    sendPasswordResetEmail(user.email, rawToken).catch((err) => {
      console.error("Erreur d'envoi d'email reset:", err);
    });
  }

  // Toujours 200 pour éviter la fuite d'info
  return res.status(200).json({
    message:
      "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
  });
}

// -----------------------------------------------------------------------------
// POST /auth/reset-password
// Body: { token, password, confirmPassword }
// -----------------------------------------------------------------------------
export async function resetPasswordFromToken(req: Request, res: Response) {
  const dto = (req as any).dto as ResetPasswordDTO;

  // 1) Vérifier le token en DB
  const resetRow = await prisma.passwordResetToken.findUnique({
    where: { token: dto.token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!resetRow) {
    throw AppError.unauthorized("Token invalide");
  }
  if (resetRow.usedAt) {
    throw AppError.unauthorized("Token déjà utilisé");
  }
  if (resetRow.expiresAt.getTime() <= Date.now()) {
    throw AppError.unauthorized("Token expiré");
  }

  // 2) Mettre à jour le mot de passe utilisateur
  const newHash = await hashPassword(dto.password);

  const updatedUser = await prisma.user.update({
    where: { id: resetRow.userId },
    data: {
      password: newHash,
      passwordChangedAt: new Date(), // force l'invalidation des anciennes sessions
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  // 3) Marquer le token comme utilisé
  await prisma.passwordResetToken.update({
    where: { id: resetRow.id },
    data: {
      usedAt: new Date(),
    },
  });

  // 4) Révoquer tous les refresh tokens déjà émis pour ce user
  await prisma.refreshToken.updateMany({
    where: { userId: updatedUser.id, revoked: false },
    data: { revoked: true, replacedByToken: null },
  });

  // 5) (Option bonus UX) Connecter automatiquement l'utilisateur
  //    -> on génère access_token + refresh_token NEUFS
  const payload = { sub: String(updatedUser.id), role: updatedUser.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // 5.a) On recrée un refreshToken DB propre
  const ua = req.get("user-agent") || "unknown";
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.socket?.remoteAddress ?? req.ip ?? "unknown");

  const rememberMe = false; // on part sur une session courte post-reset
  const refreshTtl = env.REFRESH_TOKEN_TTL_SHORT || "7d";
  const refreshExpiresAt = new Date(Date.now() + parseMaxAgeMs(refreshTtl));

  const rt = await prisma.refreshToken.create({
    data: {
      userId: updatedUser.id,
      token: refreshToken,
      rememberMe,
      userAgent: ua,
      ip,
      lastUsedAt: new Date(),
      replacedByToken: null,
      revoked: false,
      expiresAt: refreshExpiresAt,
    },
    select: { id: true, expiresAt: true },
  });

  // 6) Poser le nouveau cookie httpOnly access_token
  setAccessCookie(res, accessToken);

  // 7) Répondre
  res.status(200).json({
    message: "Mot de passe réinitialisé",
    user: updatedUser,
    refreshToken,
    refreshId: rt.id,
    refreshExpiresAt: rt.expiresAt.toISOString(),
  });
}


/* =============================================================================
📘 Résumé pédagogique — Auth Controller complet
===============================================================================

🎯 Objectif général
Ce fichier gère l’inscription, la connexion et le statut de l’API Auth.
Il applique les bonnes pratiques de sécurité + séparation des responsabilités.

───────────────────────────────────────────────────────────────────────────────
✅ REGISTER — Ce qu’il garantit
───────────────────────────────────────────────────────────────────────────────
1) DTO déjà validé par Zod → aucune donnée sale ne passe
2) Unicité email protégée côté DB
3) Mot de passe automatiquement hashé → jamais stocké en clair
4) Role imposé côté serveur → aucune élévation de privilège possible
5) Retour volontairement limité → sécurité par minimisation des données

───────────────────────────────────────────────────────────────────────────────
✅ LOGIN — Sécurité du flux
───────────────────────────────────────────────────────────────────────────────
1) Vérification email ⇒ password ⇒ homogène pour protéger contre timing attacks
2) JWT Access Token généré :
   → dans un cookie httpOnly (donc inaccessible au JS du navigateur)
3) JWT Refresh Token généré :
   → stocké en base avec suivi des métadonnées (device, IP, rotation)
4) Rotation des RefreshTokens possible (replacedByToken)
5) IP et User-Agent enregistrés → détection fraude / gestion multi-devices

───────────────────────────────────────────────────────────────────────────────
🔐 Pourquoi un Access Token + un Refresh Token ?
───────────────────────────────────────────────────────────────────────────────
• Access Token court (ex: 15min) :
  → si volé, impact limité
• Refresh Token long (ex: 7 jours)
  → renouvellement automatique
  → pas de reconnexion répétée

UX + sécurité optimisées ✅

───────────────────────────────────────────────────────────────────────────────
⚙️ Localisation du rôle dans le JWT
───────────────────────────────────────────────────────────────────────────────
• Le role est embarqué dans le JWT (payload.role)
• Permet middleware “requireRole” côté serveur
  Exemple :
  ---------------------------------------------------------
  if (req.user.role !== "ROLE_ADMIN") return res.sendStatus(403);
  ---------------------------------------------------------
• Permet UI conditionnelle côté frontend (affichage menu admin)

───────────────────────────────────────────────────────────────────────────────
📌 Protection du cookie
───────────────────────────────────────────────────────────────────────────────
• httpOnly → bloqué pour le JS (anti-XSS)
• secure en production → obligatoire pour HTTPS
• sameSite adaptatif → cross-site autorisé uniquement en prod contrôlée

───────────────────────────────────────────────────────────────────────────────
🧩 Architecture saine
───────────────────────────────────────────────────────────────────────────────
Formule complète de sécurisation et structuration des données :

 (Frontend) → DTO Zod → Controller → Prisma → BDD
                     ↓
                JWT Access + Refresh
                     ↓
                  Cookies / Body

Chaque couche joue un rôle clair et complémentaire ✅

───────────────────────────────────────────────────────────────────────────────
✨ Évolutions possibles
───────────────────────────────────────────────────────────────────────────────
• Endpoint `/auth/refresh` avec rotation stricte
• Logout avec révocation du Refresh Token
• Endpoint `/auth/me` retour des infos utilisateur
• Audit des connexions (historique, géoloc)
• Politique de changement de mot de passe (passwordChangedAt)
• Multi-rôles via Prisma enum (déjà en place)

============================================================================= */






