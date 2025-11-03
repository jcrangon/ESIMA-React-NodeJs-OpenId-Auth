import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { env } from "../config/env";

// Payload attendu dans l'access token généré par signAccessToken()
type AccessTokenPayload = {
  sub: string;   // l'id utilisateur sous forme de string
  role: string;  // ex: "ROLE_USER"
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
};

// On enrichit le type Request pour stocker l'utilisateur courant
declare module "express-serve-static-core" {
  interface Request {
    auth?: {
      userId: number;
      role: string;
      email?: string;
      name?: string;
    };
  }
}

/**
 * Middleware requireAuth
 * - lit le cookie httpOnly "access_token"
 * - vérifie la signature du JWT d'accès
 * - attache les infos utiles de l'utilisateur à req.auth
 *
 * Si quelque chose ne va pas -> 401 Unauthorized
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;
  if (!token) {
    return next(AppError.unauthorized("Token d'accès manquant"));
  }

  const ISSUER = env.JWT_ISSUER || "my-app";
  const AUDIENCE = env.JWT_AUDIENCE || "my-app-users";

  let decoded: AccessTokenPayload;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    }) as AccessTokenPayload;
  } catch {
    return next(AppError.unauthorized("Token d'accès invalide ou expiré"));
  }

  if (!decoded.sub || !decoded.role) {
    return next(AppError.unauthorized("Token incomplet"));
  }

  // On fixe l'identité courante sur la requête
  req.auth = {
    userId: Number(decoded.sub),
    role: decoded.role,
    email: decoded.email,
    name: decoded.name,
  };

  next();
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — requireAuth middleware
===============================================================================

But :
- Protéger les routes privées.
- Vérifier le cookie httpOnly "access_token".
- Mettre l'identité utilisateur dispo pour les contrôleurs via req.auth.

Pourquoi lire le cookie ?
- Dans ton design, l'access token N'EST PAS dans le localStorage côté front.
- Il est en cookie httpOnly → donc le JS du navigateur ne peut pas le voler (anti-XSS).
- MAIS ça veut dire que seul le serveur peut le lire, donc c'est le middleware qui doit le décoder.

Pourquoi vérifier issuer / audience ?
- Empêche d'accepter un JWT forgé pour un autre service.
- issuer (iss) = qui a émis le token.
- audience (aud) = pour qui est le token.
- Ça évite qu'un token signé pour un microservice interne soit accepté ici.

Pourquoi attacher req.auth ?
- Pour éviter de redécoder le JWT dans chaque contrôleur protégé.
- Les contrôleurs privés deviennent ultra simples : ils font confiance à req.auth.

Note :
- Si le token est expiré → 401.
- Si le cookie n'existe pas → 401.
- Si le payload ne contient pas sub et role → 401.
============================================================================= */
