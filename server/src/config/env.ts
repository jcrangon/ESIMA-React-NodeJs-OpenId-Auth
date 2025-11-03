// src/config/env.ts
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

// ─────────────────────────────────────────────────────────────────────────────
// 1) Pré-charge .env (facultatif, pour récupérer NODE_ENV défini dedans)
//    → NE LOGUE PAS TROP, juste pour lire NODE_ENV s'il existe
// ─────────────────────────────────────────────────────────────────────────────
const baseEnvPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(baseEnvPath)) {
  dotenv.config({ path: baseEnvPath });
}

// 2) Determine NODE_ENV (priorité à la variable système)
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";
const IS_DEV = !IS_PROD;

// 3) Charge et SURCHARGE le bon fichier .env.<env>
const specificEnvPath = path.resolve(process.cwd(), `.env.${NODE_ENV}`);
if (fs.existsSync(specificEnvPath)) {
  dotenv.config({ path: specificEnvPath, override: true });
  if (IS_DEV) console.log(`[env] Loaded environment file: .env.${NODE_ENV}`);
} else if (IS_DEV) {
  console.warn(`[env] No environment file found for ".env.${NODE_ENV}"`);
}

// ─────────────────────────────────────────────────────────────────────────────
// À partir d'ici, process.env contient :
//   - les variables système (prioritaires)
//   - puis .env
//   - puis .env.${NODE_ENV} (override final)
// ─────────────────────────────────────────────────────────────────────────────

const required = [
  "DATABASE_URL",
  "MONGO_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "UPLOAD_DIR",
] as const;

for (const k of required) {
  if (!process.env[k]) {
    throw new Error(
      `❌ Missing required env var "${k}" in environment "${NODE_ENV}". Check ".env.${NODE_ENV}" (and .env).`
    );
  }
}

// Sécurité + confort
let LOG_LEVEL = (process.env.LOG_LEVEL || (IS_PROD ? "info" : "debug")).toLowerCase();
if (IS_PROD && LOG_LEVEL === "debug") LOG_LEVEL = "info";

const splitCsv = (v?: string) =>
  (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const CORS_ORIGINS = splitCsv(process.env.CORS_ORIGIN || "http://localhost:5173");

export const env = {
  NODE_ENV,
  IS_PROD,
  IS_DEV,

  PORT: Number(process.env.PORT || 8080),
  LOG_LEVEL,

  DATABASE_URL: process.env.DATABASE_URL!,
  MONGO_URL: process.env.MONGO_URL!,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || "15m",
  REFRESH_TOKEN_TTL_SHORT: process.env.REFRESH_TOKEN_TTL_SHORT || "7d",
  REFRESH_TOKEN_TTL_LONG: process.env.REFRESH_TOKEN_TTL_LONG || "30d",

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "localhost",
  CORS_ORIGIN: CORS_ORIGINS[0] || "",
  CORS_ORIGINS,

  COOKIE_SECURE: IS_PROD,
  UPLOAD_DIR: process.env.UPLOAD_DIR!,
  MAX_UPLOAD_SIZE_MB: process.env.MAX_UPLOAD_SIZE_MB || "5",
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || "12",
  JWT_ISSUER: process.env.JWT_ISSUER || "my-app",
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || "my-app-users",

  FRONTEND_RESET_URL: process.env.FRONTEND_RESET_URL || "http://localhost:5173/auth/reset-password",
  SMTP_HOST: process.env.SMTP_HOST || "localhost",
  SMTP_PORT: process.env.SMTP_PORT || "25",
  SMTP_USER: process.env.SMTP_USER || "smtp-test",
  SMTP_PASS: process.env.SMTP_PASS || "123456",
};

if (IS_DEV) {
  console.log(`[env] Mode: ${env.NODE_ENV}, Port: ${env.PORT}`);
}

/* ============================================================================
📘 Résumé pédagogique — `env.ts` (sélection auto du .env + validation)
----------------------------------------------------------------------------
Objectif
- Centraliser et sécuriser la configuration de l’application.
- Charger AUTOMATIQUEMENT le bon fichier `.env` selon l’environnement.
- Valider les variables critiques dès le démarrage (fail fast).

Comment ça charge ?
1) Pré-charge `.env` à la racine (pour récupérer un éventuel NODE_ENV).
2) Détermine NODE_ENV (priorité aux variables système).
3) Charge `.env.<NODE_ENV>` avec `override: true` (surpasse `.env`).
4) Résultat final dans `process.env` :
   - Variables système (prioritaires)
   - puis `.env`
   - puis `.env.<NODE_ENV>` (override final)

Variables indispensables
- La liste `required` définit les clés critiques (DB, JWT, UPLOAD_DIR).
- Si l’une manque : on lève une erreur explicite et on ARRÊTE l’application.
  ➜ Évite les crashs tardifs (connexion DB, auth, etc.).

Ergonomie & sécurité
- `LOG_LEVEL` : par défaut `debug` en dev, `info` en prod (jamais de debug verbeux en prod).
- `CORS_ORIGINS` : support du CSV → plus pratique pour configurer plusieurs frontends.
- `COOKIE_SECURE` : true en production (utile pour configurer les cookies httpOnly).

Ce que l’objet `env` expose (à importer partout)
- `NODE_ENV`, `IS_PROD`, `IS_DEV` : pour les branches de code conditionnelles.
- Ports, logs : `PORT`, `LOG_LEVEL`.
- Connexions : `DATABASE_URL`, `MONGO_URL`.
- Sécurité : `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, TTL d’accès/refresh.
- Front/Back : `COOKIE_DOMAIN`, `CORS_ORIGIN` (compat), `CORS_ORIGINS` (tableau).
- Fichiers : `UPLOAD_DIR`.

Bonnes pratiques
- Jamais de secrets en clair dans le code : uniquement via `.env.*` ou variables système.
- Versionner un `.env.example` sans secrets ; ignorer `.env*` dans `.gitignore`.
- En prod/Docker/CI : préférer des variables d’environnement au runtime ou `env_file`.
- Toujours loguer sobrement en production (pas d’info sensible).

Bénéfices pédagogiques
- Séparation claire code / configuration.
- Robustesse (validation immédiate).
- Portabilité (local, Docker, CI/CD, prod) sans changer le code.
- Lisibilité : un point d’entrée unique pour toute la config.

Exemple d’utilisation
  import { env } from "./config/env";
  app.listen(env.PORT, () => console.log(`API on :${env.PORT}`));
=========================================================================== */
