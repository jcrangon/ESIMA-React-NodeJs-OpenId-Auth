// src/dtos/auth.dto.ts
import { z } from "zod";

/** Register */
export const registerSchema = z
  .object({
    // ✅ transforms -> pipe(z.email({...}))
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: "Email invalide" })),

    password: z
      .string()
      .min(8, "Mot de passe trop court (≥ 8)")
      .max(128, "Mot de passe trop long (≤ 128)")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Doit contenir au moins 1 minuscule, 1 majuscule et 1 chiffre"
      ),

    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

export type RegisterDTO = z.infer<typeof registerSchema>;

/** Login */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Email invalide" })),
  password: z.string().min(1, "Le mot de passe est requis"),
  rememberMe: z.boolean().optional(),
});

export type LoginDTO = z.infer<typeof loginSchema>;


/** Refresh Token */
export const refreshSchema = z.object({
  refreshToken: z
    .string()
    .trim()
    .min(20, "Refresh token invalide"), // format minimal, anti-empty
});

export type RefreshDTO = z.infer<typeof refreshSchema>;


/** Forgot password (demande d'email reset) */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Email invalide" })),
});
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

/** Reset password (soumission du nouveau mot de passe) */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requis"),
    password: z
      .string()
      .min(8, "Mot de passe trop court (≥ 8)")
      .max(128, "Mot de passe trop long (≤ 128)")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Doit contenir au moins 1 minuscule, 1 majuscule et 1 chiffre"
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;


/* -----------------------------------------------------------------------------
   📘 Résumé pédagogique — Auth DTO + Zod v4
   ----------------------------------------------------------------------------- 

🎯 Objectif du fichier
Ce module définit les **formats exacts** que doivent respecter les données liées
à l’authentification, tant au **frontend** (formulaires) qu’au **backend** (API).

✅ Cela empêche l’entrée de données incohérentes, mal formatées ou dangereuses.

───────────────────────────────────────────────────────────────────────────────
🧩 registerSchema — Points clés pédagogique
───────────────────────────────────────────────────────────────────────────────
| Champ            | Validation | Pourquoi ? |
|-----------------|------------|------------|
| email           | trim + lowerCase + pipe(email) | Normalisation + format email conforme |
| password        | 8–128 + regex forces de complexité | Sécurité minimale et protection brute forcée |
| confirmPassword | simple string + refine | Validation transversale → égalité des 2 mots de passe |

📍 `.pipe(z.email())` = API recommandée Zod v4 **sans dépréciation**
📍 `.refine()` permet la vérification multi-champs → UX propre sur confirmPassword

───────────────────────────────────────────────────────────────────────────────
🔐 loginSchema — Rappel pédagogique
───────────────────────────────────────────────────────────────────────────────
- Email validé **identique** à register (cohérence globale)
- Password obligatoire (min 1 caractère)

───────────────────────────────────────────────────────────────────────────────
🎯 Types auto-générés
───────────────────────────────────────────────────────────────────────────────
`RegisterDTO` est **déduit automatiquement** du schéma →  
✔️ correction automatique du typage si le schéma évolue  
✔️ complétion IDE parfaite

Exemple d’utilisation côté backend :
------------------------------------
const parsed = registerSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ errors: parsed.error.issues });
}
// ✅ parsed.data entièrement validé et typé


Exemple React Hook Form côté frontend :
---------------------------------------
useForm<RegisterDTO>({
  resolver: zodResolver(registerSchema),
});

───────────────────────────────────────────────────────────────────────────────
🛡️ Sécurité & Bonnes pratiques
───────────────────────────────────────────────────────────────────────────────
✅ Toujours hasher le password en base (jamais en clair)
✅ Ne jamais renvoyer `password` ni `confirmPassword` dans la réponse API
✅ Messages pensés pour l’UX (clairs + contextualisés)

───────────────────────────────────────────────────────────────────────────────
🚀 Extensions possibles
───────────────────────────────────────────────────────────────────────────────
• Ajout d’un `changePasswordSchema`
• Métadonnées email (domaine pros interdit, etc.)
• transform() pour exclure confirmPassword du payload final
• Validation asynchrone d’unicité email côté backend

───────────────────────────────────────────────────────────────────────────────

Résumé final :
Ces schémas garantissent une **authentification robuste**, **propre**,
**typée** et **homogène** sur tout le projet ✅

----------------------------------------------------------------------------- */
