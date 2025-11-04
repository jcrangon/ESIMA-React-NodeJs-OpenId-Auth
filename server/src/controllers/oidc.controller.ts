// src/controllers/oidc.controller.ts
import type { Request, Response } from "express";
import * as oidc from "openid-client";

import { getKeycloakConfig, createPkceAndState } from "../auth/keycloakClient";
import { prisma } from "../db/postgres";
import {
  setAccessCookie,
  signAccessToken,
  signRefreshToken,
  parseMaxAgeMs,
} from "../utils/jwt";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

/**
 * Petit helper pour décoder un JWT SANS vérification cryptographique.
 * Ici c'est OK parce que:
 * - le token vient DIRECTEMENT de ton Keycloak (backend → backend),
 * - tu ne fais pas de validation de sécurité uniquement dessus,
 *   tu t’en sers juste pour lire email / name.
 */
function decodeJwtUnverified(token: string): any {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("JWT malformed");
  }
  const payload = parts[1];
  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(decoded);
}

const FRONTEND_BASE_URL = env.FRONTEND_BASE_URL || "http://localhost:5173";

/**
 * GET /auth/oidc/login
 *
 * Lance le flow OIDC:
 *  - génère PKCE (code_verifier / code_challenge)
 *  - génère un state aléatoire
 *  - stocke verifier + state dans des cookies httpOnly
 *  - construit l'URL d'autorisation Keycloak
 *  - redirige l'utilisateur vers Keycloak
 */
export async function oidcLogin(_req: Request, res: Response) {
  const config = await getKeycloakConfig();
  const { code_verifier, code_challenge, state } =
    await createPkceAndState();

  // cookies de courte durée pour stocker le PKCE + state
  res.cookie("kc_pkce_verifier", code_verifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 5 * 60 * 1000, // 5 minutes
  });

  res.cookie("kc_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 5 * 60 * 1000,
  });

  const redirect_uri = env.KEYCLOAK_REDIRECT_URI;
  const scope = "openid email profile";

  const params: Record<string, string> = {
    redirect_uri,
    scope,
    code_challenge,
    code_challenge_method: "S256",
    state,
  };

  const authorizationUrl: URL = oidc.buildAuthorizationUrl(
    config,
    params
  );

  return res.redirect(authorizationUrl.href);
}

/**
 * GET /auth/callback
 *
 * Callback Keycloak:
 *  - reçoit ?code=...&state=...
 *  - récupère PKCE verifier + state depuis les cookies
 *  - échange le code contre des tokens avec authorizationCodeGrant()
 *  - décode l'id_token pour récupérer email / name
 *  - upsert l'utilisateur dans ta DB (via Prisma)
 *  - génère tes propres accessToken + refreshToken
 *  - stocke le refresh en BDD + met l'access en cookie httpOnly
 *  - redirige vers ton FRONTEND_BASE_URL
 */
export async function oidcCallback(req: Request, res: Response) {
  const config = await getKeycloakConfig();

  const storedState = req.cookies?.kc_state;
  const code_verifier = req.cookies?.kc_pkce_verifier;

  if (!storedState || !code_verifier) {
    throw AppError.badRequest(
      "Paramètres OIDC expirés ou manquants (state / PKCE)"
    );
  }

  // on nettoie les cookies PKCE + state
  res.clearCookie("kc_state", { path: "/" });
  res.clearCookie("kc_pkce_verifier", { path: "/" });

  // reconstruire l'URL actuelle (redirect_uri + query) pour authorizationCodeGrant
  const currentUrl = new URL(
    `${req.protocol}://${req.get("host")}${req.originalUrl}`
  );

  // échange code -> tokens (access_token, id_token, etc.)
  const tokens: oidc.TokenEndpointResponse =
    await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: code_verifier,
      expectedState: storedState,
    });

  if (!tokens.id_token) {
    throw AppError.unauthorized("ID Token manquant dans la réponse OIDC");
  }

  // 🔎 On décode l'id_token (non vérifié cryptographiquement, mais suffisant ici)
  const claims = decodeJwtUnverified(tokens.id_token);

  // Tu peux faire un console.log pour voir ce que renvoie Keycloak:
  // console.log("OIDC claims:", claims);

  const email =
    claims.email ||
    `${claims.sub}@${env.KEYCLOAK_REALM}.keycloak.local`;
  const name = claims.name || claims.preferred_username || null;

  // Upsert utilisateur dans ta table "user" via Prisma
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      // tu peux mettre à jour d'autres infos (picture, lastLoginAt, etc.)
    },
    create: {
      email,
      name,
      // L'utilisateur OIDC ne passe pas par le login/password local
      // On met un placeholder. Tu peux aussi gérer un provider externe.
      password: "OIDC_USER",
      role: "ROLE_USER", // ou logique plus fine selon les roles Keycloak
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  // On génère nos tokens app (comme dans /auth/login)
  const payload = { sub: String(user.id), role: user.role as any };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Métadonnées côté refresh token (tu suis déjà ce modèle dans login / refresh)
  const ua = req.get("user-agent") || "unknown";
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.socket?.remoteAddress ?? req.ip ?? "unknown");

  const rememberMe = false; // pour OIDC, on part sur un refresh "short"
  const refreshTtl = env.REFRESH_TOKEN_TTL_SHORT;
  const refreshExpiresAt = new Date(Date.now() + parseMaxAgeMs(refreshTtl));

  await prisma.refreshToken.create({
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
  });

  // Pose ton access_token en cookie httpOnly (helper existant)
  setAccessCookie(res, accessToken);

  // Redirection finale vers le front (home, dashboard, etc.)
  return res.redirect(FRONTEND_BASE_URL);
}
