// src/middlewares/validate.ts
import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Source = "body" | "query" | "params";

export function validate<T>(schema: ZodType<T>, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const input =
        source === "body" ? req.body :
        source === "query" ? req.query :
        req.params;

      const parsed = schema.parse(input);
      (req as any).dto = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — Middleware validate()
===============================================================================

🎯 But
Garantir que les contrôleurs reçoivent uniquement des données **valides, typées
et cohérentes**, en déchargeant la logique métier des vérifications d’entrée.

──────────────────────────────────────────────────────────────────────────────
🔄 Cycle de traitement
1️⃣ Le client envoie une requête
2️⃣ validate(schema) vérifie body/query/params avec Zod
3️⃣ Si OK → les données validées sont stockées dans req.dto
4️⃣ Si erreur → next(err) → errorHandler renvoie 422 VALIDATION_ERROR

──────────────────────────────────────────────────────────────────────────────
✅ Avantages
- Séparation claire : **validation ↔ logique métier**
- Contrôleurs plus lisibles et testables
- Aucune donnée invalide ne touche la base
- Messages d’erreurs standardisés pour le front
- Zod → TypeScript : typage automatique

──────────────────────────────────────────────────────────────────────────────
💡 Exemple d’utilisation
r.post("/register", validate(registerSchema), asyncHandler(register));

──────────────────────────────────────────────────────────────────────────────
📌 À retenir
✔ Centralise la validation
✔ Données propres et sûres dans req.dto
✔ Gestion homogène des erreurs via errorHandler
✔ Réutilisable pour toutes les routes
============================================================================= */
