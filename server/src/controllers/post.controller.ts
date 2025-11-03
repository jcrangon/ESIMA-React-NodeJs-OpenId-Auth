import type { Request, Response } from "express";
import { prisma } from "../db/postgres";
import { AppError } from "../errors/AppError";


export async function status(req: Request, res:Response) {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
}


/**
 * GET /posts
 * Liste globale des posts (tous les posts, tous auteurs).
 * → Accessible sans auth, c'est du "feed public".
 */
export async function listAllPosts(req: Request, res: Response) {
  // 1. Lire page & limit depuis la query string
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 10, 1),
    100 // sécurité anti DDOS: pas plus de 100 d'un coup
  );
  const skip = (page - 1) * limit;

  // 2. Récupérer les posts
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        coverUrl: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.post.count(),
  ]);

  // 3. Construire la réponse paginée
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
 * GET /posts/me
 * Retourne UNIQUEMENT les posts de l'utilisateur connecté.
 * → Protégé par requireAuth
 */
export async function listMyPosts(req: Request, res: Response) {
  if (!req.auth) {
    throw AppError.unauthorized("Non authentifié");
  }

  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 10, 1),
    100
  );
  const skip = (page - 1) * limit;

  const where = { authorId: req.auth.userId };

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        coverUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.post.count({ where }),
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
 * GET /posts/:id
 * Détail d'un post public.
 * → Pas besoin d'être connecté pour lire.
 */
export async function getPostById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw AppError.badRequest("ID invalide");
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      coverUrl: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  if (!post) {
    throw AppError.notFound("Article introuvable");
  }

  res.status(200).json({ post });
}

/**
 * POST /posts
 * Crée un nouveau post pour l'utilisateur connecté.
 * → Protégé par requireAuth
 */
export async function createPost(req: Request, res: Response) {
  if (!req.auth) {
    throw AppError.unauthorized("Non authentifié");
  }

  // pas de DTO fourni par toi ici, je fais simple :
  const { title, content, coverUrl } = req.body ?? {};
  if (!title || !content) {
    throw AppError.badRequest("title et content sont requis");
  }

  // Si multer a reçu un fichier ("cover" côté front),
  // il sera dispo dans req.file
  // Typiquement req.file = {
  //   filename: "1730568459384-banner-home.png",
  //   path: ".../uploads/1730568459384-banner-home.png",
  //   mimetype: "image/png",
  //   ...
  // }
  //
  // On veut stocker en DB une URL exploitable par le front.
  // Exemple: "/uploads/1730568459384-banner-home.png"
  let finalCoverUrl: string | null = null;

  if (req.file && req.file.filename) {
    // cas upload local
    finalCoverUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.coverUrl && typeof req.body.coverUrl === "string") {
    // fallback si jamais tu continues d'accepter une URL directe
    finalCoverUrl = req.body.coverUrl;
  } else {
    finalCoverUrl = null;
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      coverUrl: finalCoverUrl,
      authorId: req.auth.userId,
    },
    select: {
      id: true,
      title: true,
      content: true,
      coverUrl: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
    },
  });

  res.status(201).json({ post });
}

/**
 * PATCH /posts/:id
 * Met à jour un post existant.
 * Règle : seul l'auteur peut modifier son propre post.
 * → Protégé par requireAuth
 */
export async function updatePost(req: Request, res: Response) {
  if (!req.auth) {
    throw AppError.unauthorized("Non authentifié");
  }

  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw AppError.badRequest("ID invalide");
  }

  // Vérifier que je suis bien auteur OU admin
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });

  if (!existing) {
    throw AppError.notFound("Article introuvable");
  }

  if (existing.authorId !== req.auth.userId && req.auth.role !== "ROLE_ADMIN") {
    throw AppError.forbidden("Accès refusé");
  }

  const { title, content } = req.body ?? {};

  // on prépare un objet 'data' dynamiquement
  const dataToUpdate: Record<string, unknown> = {};

  if (title && typeof title === "string") {
    dataToUpdate.title = title;
  }
  if (content && typeof content === "string") {
    dataToUpdate.content = content;
  }

  // Gestion de l'image :
  // - si nouvelle image uploadée (req.file), on remplace coverUrl
  // - sinon si coverUrl texte passé (ex: URL externe), on la prend
  // - sinon si rien fourni, on NE TOUCHE PAS coverUrl
  if (req.file && req.file.filename) {
    dataToUpdate.coverUrl = `/uploads/${req.file.filename}`;
  } else if (typeof req.body.coverUrl === "string") {
    dataToUpdate.coverUrl = req.body.coverUrl;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    throw AppError.badRequest("Rien à mettre à jour");
  }

  const updated = await prisma.post.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      title: true,
      content: true,
      coverUrl: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
    },
  });

  res.status(200).json({ post: updated });
}

/**
 * DELETE /posts/:id
 * Supprime un post.
 * Règle : seul l'auteur OU un admin peut supprimer.
 * → Protégé par requireAuth
 */
export async function deletePost(req: Request, res: Response) {
  if (!req.auth) {
    throw AppError.unauthorized("Non authentifié");
  }

  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw AppError.badRequest("ID invalide");
  }

  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });

  if (!existing) {
    throw AppError.notFound("Article introuvable");
  }

  if (existing.authorId !== req.auth.userId && req.auth.role !== "ROLE_ADMIN") {
    throw AppError.forbidden("Accès refusé");
  }

  await prisma.post.delete({
    where: { id },
  });

  res.status(200).json({ message: "Supprimé" });
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — post.controller.ts
===============================================================================

Principes de sécurité appliqués :
1. requireAuth est obligatoire pour toute action "qui me concerne" ou "qui modifie".
   - createPost
   - listMyPosts
   - updatePost
   - deletePost
   Ces fonctions lisent req.auth, qui est rempli par le middleware d'authentification
   à partir du cookie access_token.

2. Ownership (propriété du contenu)
   On compare existing.authorId avec req.auth.userId.
   → Si ça ne match pas ET que l'utilisateur n'est pas ROLE_ADMIN → 403.

3. Visibilité
   - /posts (listAllPosts) et /posts/:id sont publics
     car lire n'exige pas forcément d'être connecté dans ton use case.
   - /posts/me ne renvoie QUE les posts de l'utilisateur connecté.

4. Séparation des responsabilités
   - Le contrôleur ne s'occupe pas de vérifier le token.
     Il fait confiance à req.auth.
   - C'est requireAuth (middleware) qui s'occupe du cookie/access_token/JWT.
============================================================================= */
