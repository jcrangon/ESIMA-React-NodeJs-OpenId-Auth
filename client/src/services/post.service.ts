// src/services/posts.service.ts
import { api } from "@/axios/axios";

export type Author = {
  id: number;
  name: string | null;
  email: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
};

export type Post = {
  id: number;
  title: string;
  content: string;
  coverUrl: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  author: Author;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PaginatedPostsResponse = {
  data: Post[];
  pagination: PaginationMeta;
};

// Récupère les posts publics paginés
export async function fetchPosts(page = 1, limit = 10) {
  const res = await api.get<PaginatedPostsResponse>("/posts", {
    params: { page, limit },
  });
  return res.data;
}

export async function fetchPostById(id: number) {
  const res = await api.get(`/posts/${id}`, {
    // route publique, donc pas besoin de skipAuthRefresh
    // sauf si ton backend exige auth pour voir un post
  });

  // on suppose que le backend renvoie :
  // {
  //   post: {
  //     id, title, content, coverUrl,
  //     createdAt, updatedAt,
  //     author: { id, name, email, role }
  //   }
  // }
  return res.data.post;
}

// cree l'url  complète  d'une  image  à  partir  du  coverUrl  relative
export function createImageUrl(coverUrl: string | null | undefined): string | null {
  if (!coverUrl) return null;

  // 1. si déjà absolu (http/https), on renvoie tel quel
  if (/^https?:\/\//i.test(coverUrl)) {
    return coverUrl;
  }

  // 2. sinon, on le considère comme chemin relatif genre "/uploads/xxx.jpg"
  // api.defaults.baseURL vient de axios.ts -> ex: "http://localhost:8080"
  const base = api.defaults.baseURL ?? "";
  // éviter les doublons de slash genre "http://localhost:8080//uploads/img.png"
  return `${base.replace(/\/+$/, "")}${coverUrl.startsWith("/") ? "" : "/"}${coverUrl}`;
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — src/services/posts.service.ts
===============================================================================

But du fichier :
----------------
Ce fichier contient les fonctions de "service" liées aux posts.
Ici : `fetchPosts(page, limit)` qui consomme l'endpoint GET /posts du backend.

Pourquoi séparer ça d'Axios ?
-----------------------------
- `src/axios/axios.ts` = configuration technique d'Axios (URL, cookies, headers, etc.)
- `src/services/...`   = logique métier d'appel d'API (fetchPosts, fetchUser, etc.)

Intérêt :
---------
1. Le composant React (Home.tsx) n'a pas besoin de connaître les détails HTTP.
   Il appelle juste `fetchPosts()`.
2. On définit nos types Post, PaginationMeta, PaginatedPostsResponse ici.
   → Intelligent pour l’autocomplétion TypeScript et la doc du contrat backend.

Structure attendue depuis le backend :
--------------------------------------
GET /posts renvoie un objet de la forme :
{
  "data": [
    {
      "id": 1,
      "title": "...",
      "content": "...",
      "coverUrl": "https://...",
      "createdAt": "2025-10-31T10:00:00.000Z",
      "updatedAt": "2025-10-31T10:05:00.000Z",
      "author": {
        "id": 2,
        "name": "Jean",
        "email": "jean@example.com",
        "role": "ROLE_USER"
      }
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}

Ce contrat correspond EXACTEMENT aux types TS ci-dessus.
============================================================================= */
