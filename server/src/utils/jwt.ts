// src/utils/jwt.ts
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const ACCESS_TTL = (env.ACCESS_TOKEN_TTL || "15m");
const REFRESH_TTL = (env.REFRESH_TOKEN_TTL || "7d");
const ISSUER = env.JWT_ISSUER || "my-app";
const AUDIENCE = env.JWT_AUDIENCE || "my-app-users";

type JwtPayload = { sub: string; role?: string };

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: parseMaxAgeMs(ACCESS_TTL) / 1000,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function signRefreshToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: parseMaxAgeMs(REFRESH_TTL) / 1000,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function setAccessCookie(
  res: import("express").Response,
  token: string
) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: isProd, // ✅ obligatoirement true en prod pour cookie cross-site
    sameSite: isProd ? "none" : "lax", // ✅ pour SPA front sur autre domaine
    path: "/",
    maxAge: parseMaxAgeMs(ACCESS_TTL),
  });
}

export function parseMaxAgeMs(ttl: string) {
  // Supporte "15m", "7d", "1h" ou valeur en secondes
  const m = /^(\d+)([smhd])$/i.exec(ttl);
  if (!m) return Number(ttl) * 1000 || 15 * 60 * 1000;
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  
  let mult: number;
  switch (u) {
    case "s":
      mult = 1000;
      break;
    case "m":
      mult = 60_000;
      break;
    case "h":
      mult = 3_600_000;
      break;
    case "d":
      mult = 86_400_000;
      break;
    default:
      mult = 1000;
  }
  
  return n * mult;
}


/* =============================================================================
📘 Résumé pédagogique complet — Utils JWT & Cookies
===============================================================================

🎯 Rôle de ce module
- Génère des **tokens signés** (avec un secret HS256)
- Gère le TTL Access/Refresh de manière cohérente
- Sécurise le cookie pour protéger l’utilisateur

──────────────────────────────────────────────────────────────────────────────
🔑 Types de jetons & usage recommandé
──────────────────────────────────────────────────────────────────────────────
| Jeton         | Durée     | Stockage        | Usage |
|---------------|-----------|----------------|-------|
| Access Token   | Court ~15m | Cookie HttpOnly | Accès API sécurisé |
| Refresh Token  | Long ~7d   | Body (ou secure cookie séparé) | Renouvellement silencieux |

✅ Si un access token est volé → impact limité  
✅ Si un refresh token fuit → rotation possible dans DB

──────────────────────────────────────────────────────────────────────────────
🛡️ Sécurité renforcée du cookie
──────────────────────────────────────────────────────────────────────────────
- `httpOnly: true` → JS du navigateur ne peut jamais le lire 🚫 (mitige XSS)
- `secure: true` en prod → force HTTPS
- `sameSite: none` en prod → **obligatoire** pour SPA sur un domaine différent

──────────────────────────────────────────────────────────────────────────────
🧭 Claims JWT inclus
──────────────────────────────────────────────────────────────────────────────
-
*/