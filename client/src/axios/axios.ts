// src/axios/axios.ts
import axios from "axios";
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean; // éviter les boucles infinies
    skipAuthRefresh?: boolean; // ne PAS tenter de refresh auto pour cette requête
  }
}

// Base URL de l'API (Vite => import.meta.env.VITE_*)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Instance unique
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // on laisse à true si ton API pose un cookie accessToken httpOnly
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* -----------------------------------------------------------------------------
   TYPE DE LA RÉPONSE D'ERREUR BACKEND
   Le backend renvoie toujours quelque chose du style :

   {
     "error": {
       "status": 409,
       "code": "UNIQUE_CONSTRAINT",
       "message": "Unique constraint violation",
       "details": {
         // peut varier :
         // Zod:
         //   { issues: [ { path: "email", message: "Email invalide", code: "invalid_string" }, ... ] }
         // Prisma P2002:
         //   { target: ["email"] }
         // Autre AppError:
         //   structure libre
       },
       "traceId": "bf91c8f5-...",
       "stack": "... (dev only)"
     }
   }
----------------------------------------------------------------------------- */

export type BackendErrorShape = {
  error?: {
    status?: number;
    code?: string;
    message?: string;
    details?: unknown;
    traceId?: string;
    stack?: string;
  };
};

/* -----------------------------------------------------------------------------
   Types utilitaires larges pour parser details sans utiliser `any`
----------------------------------------------------------------------------- */

// Format Zod normalisé par ton middleware:
// { issues: [{ path: string, message: string, code?: string }] }
type IssueItem = {
  path?: string;
  message?: string;
  code?: string;
};
type IssuesDetailsShape = {
  issues?: IssueItem[];
};

// Format Prisma unique constraint : { target: ["email", ...] }
type PrismaDetailsShape = {
  target?: unknown;
};

// ---------- HELPER NORMALISATION ERREUR POUR LE FRONT ----------
/**
 * Objectif :
 * - Retourner un message global pour bannière / feedback général
 * - Retourner une map fieldErrors: { [fieldName]: "message d'erreur" }
 *   utilisable pour afficher les erreurs sous chaque input du formulaire
 */
export function extractAppErrorPayload(err: unknown): {
  message: string;
  fieldErrors: Record<string, string>;
  traceId?: string;
} {
  // Valeurs par défaut si ce n'est pas une erreur Axios ou format inattendu
  const fallback = {
    message: "Une erreur est survenue",
    fieldErrors: {} as Record<string, string>,
    traceId: undefined as string | undefined,
  };

  const axiosErr = err as AxiosError<BackendErrorShape>;

  // si pas de réponse HTTP → probablement réseau ou CORS
  if (!axiosErr || !axiosErr.response) {
    return {
      ...fallback,
      message: axiosErr?.message || fallback.message,
    };
  }

  const data = axiosErr.response.data;
  const payload = data?.error;

  // 1. message global lisible pour l'UI (bannière rouge en haut/bas)
  const message =
    payload?.message ||
    axiosErr.message ||
    fallback.message;

  // 2. erreurs par champ (ex: { email: "Cet email est déjà utilisé" })
  // On doit interpréter payload.details selon le type d'erreur backend.
  //
  // Cas A (Zod / validation):
  //   details = { issues: [{ path: "email", message: "Invalid email" }, ...] }
  //
  // Cas B (Prisma P2002 unique constraint):
  //   details = { target: ["email"] }
  //
  // Cas C (autre AppError):
  //   details = { ... } libre → on ne force rien dans fieldErrors,
  //   on se contente du message global.
  //
  const fieldErrors: Record<string, string> = {};

  if (payload?.details && typeof payload.details === "object") {
    const detailsObj = payload.details as unknown;

    // ---- Cas A : Validation Zod
    const asIssues = detailsObj as IssuesDetailsShape;
    if (Array.isArray(asIssues.issues)) {
      for (const issue of asIssues.issues) {
        const path = issue?.path;
        const msg = issue?.message;
        if (typeof path === "string" && typeof msg === "string") {
          fieldErrors[path] = msg;
        }
      }
    }

    // ---- Cas B : Prisma unique constraint (P2002)
    const asPrisma = detailsObj as PrismaDetailsShape;
    if (Array.isArray(asPrisma.target)) {
      for (const fieldName of asPrisma.target) {
        if (typeof fieldName === "string") {
          // n'écrase pas une erreur Zod s'il y en a déjà une
          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = "Cette valeur est déjà utilisée";
          }
        }
      }
    }
  }

  return {
    message,
    fieldErrors,
    traceId: payload?.traceId,
  };
}

/* -----------------------------------------------------------------------------
   REFRESH TOKEN FLOW
   (401 expiré → on tente /auth/refresh une seule fois, puis on rejoue la requête)
----------------------------------------------------------------------------- */

let isRefreshing = false;
let pendingQueue: {
  resolve: () => void;
  reject: (e: unknown) => void;
}[] = [];

// Réveille toutes les requêtes en attente en succès
const resolveQueue = () => {
  pendingQueue.forEach(({ resolve }) => resolve());
  pendingQueue = [];
};

// Réveille toutes les requêtes en attente en échec
const rejectQueue = (error: unknown) => {
  pendingQueue.forEach(({ reject }) => reject(error));
  pendingQueue = [];
};

// Appel /auth/refresh avec le refreshToken stocké dans localStorage
async function refreshAccessToken() {
  const storedRefreshToken =
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

  if (!storedRefreshToken) {
    throw new Error("No refresh token present in localStorage");
  }

  const { data } = await api.post(
    "/auth/refresh",
    { refreshToken: storedRefreshToken },
    {
      // hyper important :
      // ne pas déclencher à nouveau l'intercepteur si /auth/refresh lui-même renvoie 401
      skipAuthRefresh: true,
    }
  );

  // Rotation du refreshToken : si l'API renvoie un nouveau refreshToken, on le remplace.
  if (data?.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  // Si ton backend renvoie aussi un accessToken dans `data.accessToken`
  // (flux Bearer pur sans cookie httpOnly),
  // tu peux ici faire :
  // api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
}

// Intercepteur global de réponse
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = (error.config || {}) as AxiosRequestConfig;

    // Ne pas tenter de refresh si :
    // - pas 401
    // - déjà retenté (_retry)
    // - requête marquée skipAuthRefresh (ex: /auth/login, /auth/register, /auth/logout)
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    // Si un refresh est déjà en cours → on attend
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: () => resolve(api(original)),
          reject,
        });
      });
    }

    // On prend la main pour faire le refresh
    original._retry = true;
    isRefreshing = true;

    try {
      await refreshAccessToken();

      // Succès du refresh → on réveille les autres
      resolveQueue();

      // et on rejoue la requête d'origine
      return api(original);
    } catch (refreshError) {
      // Échec du refresh → tout le monde échoue
      rejectQueue(refreshError);

      // refreshToken mort → nettoyage local
      if (typeof window !== "undefined") {
        localStorage.removeItem("refreshToken");
      }

      // 🔥 Très important :
      // On notifie le reste de l'app que l'auth N'EST PLUS VALIDE.
      // C'est un événement global que le AuthProvider va écouter.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE TRÈS DÉTAILLÉ — src/axios/axios.ts
===============================================================================

1. Rôle global de ce fichier
----------------------------
Ce fichier centralise toute la logique HTTP du front :
- création d'une instance Axios préconfigurée (`api`)
- gestion propre des erreurs renvoyées par le backend
- logique d'auto-refresh du token d'accès quand il expire
- rejoue automatique des requêtes après refresh
- typage strict TypeScript (zéro `any` explicite)

Résultat : tout le reste de l'app (pages, hooks, composants) consomme `api`
et récupère des erreurs propres sans avoir à tout refaire à chaque fois.


2. Instance Axios `api`
-----------------------
```ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});
*/