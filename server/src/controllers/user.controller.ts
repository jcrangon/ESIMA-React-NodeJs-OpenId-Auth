// src/controllers/user.controller.ts
import type { Request, Response } from "express";
import { prisma } from "../db/postgres";
import { AppError } from "../errors/AppError";
import { hashPassword, comparePassword } from "../utils/password";
import { setAccessCookie, signAccessToken } from "../utils/jwt";

export async function status(req: Request, res:Response) {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
}

/**
 * GET /users/me
 * Récupère le profil de l'utilisateur connecté.
 */
export async function getMe(req: Request, res: Response) {
  if (!req.auth) {
    throw AppError.unauthorized("Non authentifié");
  }

  const me = await prisma.user.findUnique({
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

  if (!me) {
    throw AppError.unauthorized("Compte introuvable ou supprimé");
  }

  res.status(200).json({ user: me });
}

/**
 * PATCH /users/me
 * Met à jour l'utilisateur courant (ex: name).
 */
export async function updateMe(req: Request, res: Response) {
  if (!req.auth) {
    throw AppError.unauthorized("Non authentifié");
  }

  const { name } = req.body ?? {};

  if (typeof name === "undefined") {
    throw AppError.badRequest("Aucune modification demandée");
  }

  const updated = await prisma.user.update({
    where: { id: req.auth.userId },
    data: {
      ...(typeof name !== "undefined" ? { name } : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({ user: updated });
}

/**
 * PATCH /users/me/password
 * Change le mot de passe du user connecté.
 * Body:
 * {
 *   "currentPassword": "...",
 *   "newPassword": "..."
 * }
 */
export async function changeMyPassword(req: Request, res: Response) {
  if (!req.auth) {
    throw AppError.unauthorized("Non authentifié");
  }

  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    throw AppError.badRequest("Mot de passe actuel et nouveau mot de passe requis");
  }

  // 1) Récupérer l'utilisateur avec le hash
  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: { id: true, email: true, name: true, role: true, password: true },
  });

  if (!user) {
    throw AppError.unauthorized("Utilisateur introuvable");
  }

  // 2) Vérifier l'ancien mdp
  const ok = await comparePassword(currentPassword, user.password);
  if (!ok) {
    throw AppError.forbidden("Mot de passe actuel incorrect");
  }

  // 3) Hasher le nouveau
  const newHash = await hashPassword(newPassword);

  // 4) Mettre à jour + timestamp passwordChangedAt
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newHash,
      passwordChangedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 5) Générer un nouveau access_token pour rester connecté tout de suite
  const payload = { sub: String(updated.id), role: updated.role };
  const newAccessToken = signAccessToken(payload);
  setAccessCookie(res, newAccessToken);

  res.status(200).json({
    message: "Mot de passe mis à jour",
    user: updated,
  });
}

/**
 * GET /users
 * (ADMIN) Liste paginée des utilisateurs.
 * Query: page, limit
 */
export async function listUsers(req: Request, res: Response) {
  // requireAuth + requireAdmin ont déjà filtré l'accès

  // pagination
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 10, 1),
    100
  );
  const skip = (page - 1) * limit;

  // fetch + count total
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data: items,
    pagination: {
      page,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}

/**
 * GET /users/:id
 * - Un admin peut lire n'importe qui.
 * - Un user normal ne peut lire QUE lui-même.
 */
export async function getUserById(req: Request, res: Response) {
  if (!req.auth) {
    throw AppError.unauthorized("Non authentifié");
  }

  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw AppError.badRequest("ID invalide");
  }

  const isSelf = req.auth.userId === id;
  const isAdmin = req.auth.role === "ROLE_ADMIN";
  if (!isSelf && !isAdmin) {
    throw AppError.forbidden("Accès refusé");
  }

  const user = await prisma.user.findUnique({
    where: { id },
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
    throw AppError.notFound("Utilisateur introuvable");
  }

  res.status(200).json({ user });
}

/**
 * PATCH /users/:id/role
 * (ADMIN) Modifier le rôle d'un utilisateur.
 * Body: { role: "ROLE_USER" | "ROLE_ADMIN" }
 */
export async function updateUserRole(req: Request, res: Response) {
  // requireAuth + requireAdmin ont déjà filtré l'accès

  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw AppError.badRequest("ID invalide");
  }

  const { role } = req.body ?? {};
  if (role !== "ROLE_USER" && role !== "ROLE_ADMIN") {
    throw AppError.badRequest("Rôle invalide");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    message: "Rôle mis à jour",
    user: updated,
  });
}

/**
 * DELETE /users/:id
 * (ADMIN) Supprime un utilisateur (et ses posts via onDelete: Cascade).
 * On empêche un admin de se supprimer lui-même.
 */
export async function deleteUser(req: Request, res: Response) {
  // requireAuth + requireAdmin ont déjà filtré l'accès

  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw AppError.badRequest("ID invalide");
  }

  if (req.auth && id === req.auth.userId) {
    throw AppError.forbidden("Tu ne peux pas te supprimer toi-même");
  }

  await prisma.user.delete({
    where: { id },
  });

  res.status(200).json({ message: "Utilisateur supprimé" });
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — user.controller.ts
===============================================================================

Objectif global du contrôleur user:
-----------------------------------
- Donner accès aux infos du compte courant.
- Permettre à chaque utilisateur de gérer son profil et son mot de passe.
- Fournir des capacités d'administration (gestion des autres utilisateurs).

Les routes typiques associées :
-------------------------------
GET    /users/me
PATCH  /users/me
PATCH  /users/me/password
GET    /users
GET    /users/:id
PATCH  /users/:id/role
DELETE /users/:id

Middleware attendu :
--------------------
Chaque route sensible doit être protégée par `requireAuth`.
Pourquoi ?
- requireAuth lit le cookie httpOnly `access_token`,
- vérifie et décode le JWT,
- puis injecte `req.auth = { userId, role, ... }`.

Ensuite le contrôleur applique de la logique d'autorisation métier.

Exemples d'autorisation :
-------------------------
1. getMe / updateMe / changeMyPassword
   - l'utilisateur doit être connecté.
   - on utilise req.auth.userId comme clé primaire en base.
   - on ne laisse pas l'utilisateur modifier son "role".

2. listUsers
   - réservé à ROLE_ADMIN.
   - pagination (page, limit) avec skip/take Prisma.
   - on renvoie aussi "pagination" : (totalItems, totalPages, hasNextPage...)
   - => prêt pour un tableau admin côté front.

3. getUserById
   - un admin peut voir n'importe qui.
   - un user normal ne peut voir que lui-même.
   - on ne renvoie jamais le hash du mot de passe.

4. changeMyPassword
   - flux sécurisé :
       a) vérif du mot de passe actuel
       b) hash du nouveau mdp
       c) mise à jour `passwordChangedAt`
          -> tous les refresh tokens plus vieux deviennent invalides grâce
             à la vérification dans /auth/refresh
       d) on redonne un nouvel access_token via `setAccessCookie`
          -> l'utilisateur reste connecté immédiatement après le changement
             de mot de passe, sans relog forcé.
   - c'est une super UX et une bonne pratique de sécurité.

5. updateUserRole & deleteUser
   - réservées à ROLE_ADMIN.
   - updateUserRole permet la gestion des droits sans passer par la DB à la main.
   - deleteUser supprime aussi les posts de l'utilisateur grâce au onDelete: Cascade
     défini dans le modèle Prisma Post.author.
   - on empêche un admin de se supprimer lui-même (protection bête mais utile).

Pagination :
------------
Dans listUsers (admin) la pagination suit le même schéma que celui qu'on a mis
pour les posts :
{
  data: [...],
  pagination: {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage
  }
}
→ Le front peut réutiliser le même composant de pagination partout
  (posts publics, mes posts, liste admin d'utilisateurs).

Sécurité générale :
-------------------
- On N'EXPOSE JAMAIS le champ `password` dans les réponses.
  Dans tous les select Prisma on prend explicitement les champs autorisés.
  (pattern "whitelist", pas "blacklist")

- On base toutes les décisions d'accès sur :
    req.auth.userId  (identité)
    req.auth.role    (autorisation ROLE_USER / ROLE_ADMIN)

- Si requireAuth n'est pas passé, req.auth n'existe pas -> AppError.unauthorized.

Ce fichier illustre le découplage :
-----------------------------------
- requireAuth : authentifie (qui es-tu ?)
- user.controller : autorise (as-tu le droit de faire ça ?)
- prisma : applique réellement la modification en base
- AppError : normalise les erreurs (401, 403, 404...) pour le front.

============================================================================= */
