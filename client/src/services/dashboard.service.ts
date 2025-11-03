// src/services/dashboard.service.ts
import { api } from "@/axios/axios";

/**
 * TYPES
 * -----
 * Les types correspondent à ce que renvoient les contrôleurs du backend.
 */

export type UserPost = {
  id: number;
  title: string;
  content: string;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserSummary = {
  id: number;
  email: string;
  name: string | null;
  role: "ROLE_USER" | "ROLE_ADMIN";
  createdAt: string;
  updatedAt: string;
};

/**
 * SHAPES DE RÉPONSE D'API
 * ----------------------
 * On les définit d'après ce que renvoient tes contrôleurs.
 *
 * listMyPosts (GET /posts/member/list)
 * ------------------------------------
 * devrait te renvoyer quelque chose du style :
 * {
 *   "data": [
 *     { id, title, content, coverUrl, createdAt, updatedAt },
 *     ...
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "totalItems": 3,
 *     "totalPages": 1,
 *     "hasNextPage": false,
 *     "hasPrevPage": false
 *   }
 * }
 */
type MyPostsApiResponse = {
  data: UserPost[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

/**
 * listUsers (GET /users?page=1&limit=10)
 * --------------------------------------
 * Ton contrôleur listUsers renvoie :
 * {
 *   "data": [
 *     { id, email, name, role, createdAt, updatedAt },
 *     ...
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "totalItems": 42,
 *     "totalPages": 5,
 *     "hasNextPage": true,
 *     "hasPrevPage": false
 *   }
 * }
 */
type AdminUsersApiResponse = {
  data: AdminUserSummary[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

/**
 * fetchMyPosts
 * ------------
 * Récupère les posts appartenant à l'utilisateur connecté.
 * Route backend: GET /posts/member/list (protégée par requireAuth)
 */
export async function fetchMyPosts(): Promise<UserPost[]> {
  const res = await api.get<MyPostsApiResponse>("/posts/member/list", {
    // pas de skipAuthRefresh -> si 401 (token expiré), l'intercepteur va tenter /auth/refresh
  });

  // On renvoie UNIQUEMENT le tableau de posts pour simplifier le composant
  return Array.isArray(res.data.data) ? res.data.data : [];
}

/**
 * deleteMyPost
 * ------------
 * Supprime un post appartenant à l'utilisateur courant.
 * Route backend: DELETE /posts/member/delete/:id
 */
export async function deleteMyPost(id: number): Promise<void> {
  await api.delete(`/posts/member/delete/${id}`, {
    // idem: laisser l'intercepteur gérer les 401 éventuels
  });
}

/**
 * fetchAllUsersForAdmin
 * ---------------------
 * Récupère la liste paginée des utilisateurs.
 * Route backend: GET /users (requireAuth + requireAdmin)
 *
 * NOTE IMPORTANTE :
 * - Le dashboard, pour l’instant, ne gère pas la pagination côté UI.
 *   On récupère page=1 limit=20 par défaut.
 *   On pourra ajouter la pagination du tableau admin plus tard.
 */
export async function fetchAllUsersForAdmin(
  page = 1,
  limit = 20
): Promise<AdminUserSummary[]> {
  const res = await api.get<AdminUsersApiResponse>("/users", {
    params: { page, limit },
    // requireAuth + requireAdmin côté serveur
  });

  return Array.isArray(res.data.data) ? res.data.data : [];
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — dashboard.service.ts
===============================================================================

Pourquoi un "service" dédié dashboard ?
---------------------------------------
- Les composants React ne doivent PAS connaître les détails des routes HTTP du backend.
- Ici on isole la logique d'appel d'API :
    - URL exacte (/posts/member/list, /users, etc.)
    - structure de réponse réelle (data, pagination)
    - extraction des listes
- Le composant DashboardPage récupère juste un tableau prêt à afficher.

Sécurité côté front :
---------------------
- On ne rajoute pas manuellement d'Authorization header : axios l'envoie déjà
  (cookie httpOnly pour l'access token, + le refresh automatique si besoin).
- Les routes protégées (requireAuth, requireAdmin) sont défendues côté serveur.
  Le front ne sert qu'à afficher/masquer l'UI selon le rôle.

Suppression d'un post :
-----------------------
- deleteMyPost appelle DELETE /posts/member/delete/:id
- En cas de succès on met à jour le state côté front (on filtre le post supprimé)
  sans avoir besoin de refetch complet.

Pagination :
------------
- Le backend renvoie `pagination` partout.
- Ici on ne l'expose pas encore au dashboard, mais on pourra :
    -> retourner aussi la pagination
    -> stocker page courante dans le dashboard
    -> afficher des boutons "suivant/précédent" admin.
============================================================================= */
