// src/middlewares/requireAdmin.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

/**
 * Middleware d'autorisation.
 * À utiliser APRÈS requireAuth.
 *
 * - Vérifie que l'utilisateur connecté est ROLE_ADMIN.
 * - Sinon -> 403 Forbidden.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  // On suppose que requireAuth a déjà injecté req.auth
  if (!req.auth) {
    return next(AppError.unauthorized("Non authentifié"));
  }

  if (req.auth.role !== "ROLE_ADMIN") {
    return next(AppError.forbidden("Accès réservé à l'administrateur"));
  }

  return next();
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — requireAdmin.middleware.ts
===============================================================================

Pourquoi ce middleware ?
------------------------
- Avant, on faisait la vérification "if (req.auth.role !== 'ROLE_ADMIN')" DIRECTEMENT
  dans chaque contrôleur admin.
- C'est répétitif, c'est bruyant, et ça mélange responsabilités.
- Maintenant, on sort cette logique dans un middleware dédié.

Chaîne typique :
----------------
1. requireAuth  → vérifie le token, peuple req.auth = { userId, role, ... }
2. requireAdmin → vérifie req.auth.role === 'ROLE_ADMIN'
3. controller   → exécute la logique métier (ex: lister les users)

Avantages :
-----------
- Les contrôleurs deviennent plus propres.
- On standardise le "403 Accès réservé à l'administrateur".
- On peut greffer facilement d'autres middlewares d'autorisation (requireOwner, etc.).

Important :
-----------
- requireAdmin suppose que requireAuth a déjà tourné.
  Donc dans les routes il FAUT faire :
    router.get("/...", requireAuth, requireAdmin, controllerFn)

============================================================================= */
