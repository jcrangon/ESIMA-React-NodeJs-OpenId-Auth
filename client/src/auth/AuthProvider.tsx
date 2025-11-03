// src/auth/authProvider.tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/axios/axios"; // Instance Axios configurée avec intercepteurs
import { AuthContext } from "./AuthContext"; // Contexte d’authentification global

import { useNavigate } from "react-router-dom";


// --- Typage utilisateur renvoyé par le backend ---
export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  role: "ROLE_USER" | "ROLE_ADMIN";
  createdAt: string; // Dates renvoyées par Prisma en ISO string
  updatedAt: string;
};

// --- Props du Provider (ReactNode = enfants à englober) ---
type AuthProviderProps = {
  children: ReactNode;
};

// --- Composant principal du Provider ---
export default function AuthProvider({ children }: AuthProviderProps) {
  // État global utilisateur : soit AuthUser, soit null si non connecté
  const [user, setUser] = useState<AuthUser | null>(null);

  // État de chargement initial (pour afficher un loader pendant la vérification de session)
  const [loading, setLoading] = useState<boolean>(true);

   const navigate = useNavigate();

  // -------------------------------------------------
  // 1️⃣ Au montage : tenter d’hydrater la session existante
  // -------------------------------------------------
  //
  // Objectif :
  // - Vérifier si l’utilisateur est encore authentifié (cookie accessToken encore valide).
  // - Si oui → on récupère ses infos avec /auth/me.
  // - Si le token est expiré mais qu’un refreshToken est encore valide,
  //   l’intercepteur Axios gérera le refresh et rejouera automatiquement /auth/me.
  //
  useEffect(() => {
    const ac = new AbortController(); // Permet d’annuler la requête si le composant est démonté

    (async () => {
      try {
        // Appel GET /auth/me : renvoie { user } si accessToken valide
        const { data } = await api.get("/auth/me", {
          signal: ac.signal,
          skipAuthRefresh: true,
        });

        // Si utilisateur trouvé → on hydrate le state
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        // Si non authentifié ou token expiré (et refresh échoué) → session nulle
        setUser(null);
      } finally {
        // Chargement terminé (qu’il y ait ou non une session valide)
        setLoading(false);
      }
    })();

    return () => ac.abort(); // Annule la requête si le composant est démonté
  }, []);

  // 🔥 2) Listener global "auth:logout"
  //
  // Objectif :
  // - axios a détecté que même le refreshToken est mort
  // - => la session est irrécupérable
  // - => on force une déconnexion front ET une redirection vers /auth/login
  //
  useEffect(() => {
    function handleForcedLogout() {
      // purge locale
      localStorage.removeItem("refreshToken");
      setUser(null);

      // et on pousse l'utilisateur vers la page de login
      navigate("/auth/login", { replace: true });
    }

    window.addEventListener("auth:logout", handleForcedLogout);
    
    return () => {
      window.removeEventListener("auth:logout", handleForcedLogout);
    };
  }, [navigate]);


  // -------------------------------------------------
  // 2️⃣ login() — Authentification classique
  // -------------------------------------------------
  //
  // Paramètres : email, password, rememberMe (facultatif)
  // - Le backend renvoie { user, refreshToken } si succès
  // - En cas d’erreur 401 (mauvais mot de passe), on NE déclenche PAS le refresh automatique
  //
  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const { data } = await api.post(
        "/auth/login",
        { email, password, rememberMe },
        {
          skipAuthRefresh: true, // ⚠️ Empêche Axios de tenter un refresh si mauvais mot de passe
        }
      );

      // Stockage du refreshToken pour usage ultérieur (/auth/refresh)
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      // Mise à jour du state utilisateur
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    },
    []
  );

  // -------------------------------------------------
  // 3️⃣ logout() — Déconnexion propre
  // -------------------------------------------------
  //
  // Objectif :
  // - Informer le backend pour invalider le refreshToken.
  // - Nettoyer le localStorage et le state React.
  //
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      await api.post(
        "/auth/logout",
        { refreshToken },
        {
          skipAuthRefresh: true, // ⚠️ On ne veut pas rafraîchir pendant un logout
        }
      );
    } catch {
      // Même si le backend renvoie une erreur (ex: déjà déconnecté), on nettoie localement
    } finally {
      // Nettoyage local complet
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  }, []);

  // -------------------------------------------------
  // 4️⃣ refreshSession() — Rafraîchir manuellement la session
  // -------------------------------------------------
  //
  // Cas d’usage :
  // - Quand on veut prolonger la session sans redemander les identifiants.
  // - Ex: après un 401 manuel sur une action sensible.
  //
  // Le backend renvoie un nouvel accessToken (via cookie ou body)
  // + un nouveau refreshToken (rotation).
  //
  const refreshSession = useCallback(async () => {
    const storedRefresh = localStorage.getItem("refreshToken");
    if (!storedRefresh) {
      throw new Error("No refresh token available");
    }

    // On appelle /auth/refresh avec le refreshToken existant
    const { data } = await api.post(
      "/auth/refresh",
      { refreshToken: storedRefresh },
      {
        skipAuthRefresh: true, // ⚠️ Evite la boucle infinie en cas d’échec
      }
    );

    // Met à jour le refreshToken si rotation côté serveur
    if (data?.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }

    // Met à jour l’utilisateur dans le contexte
    if (data?.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  }, []);


  // fonction d’adoption de session après reset de mot de passe
  const adoptSessionFromReset = useCallback(
    (newUser: AuthUser, newRefreshToken: string | undefined) => {
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      setUser(newUser);
    },
    []
  );

  
  // -------------------------------------------------
  // 5️⃣ Valeurs exposées via le Contexte
  // -------------------------------------------------
  //
  // Grâce à useMemo, les fonctions ne sont pas recréées à chaque rendu
  //
  const value = useMemo(
    () => ({
      user, // données utilisateur
      loading, // état de chargement global
      isAuthenticated: !!user, // booléen pratique
      login, // fonction login
      logout, // fonction logout
      refreshSession, // fonction refresh manuel
      adoptSessionFromReset, // fonction d’adoption de session après reset de mot de passe
    }),
    [user, loading, login, logout, refreshSession, adoptSessionFromReset]
  );

  // Fournit le contexte aux composants enfants
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — src/auth/authProvider.tsx
===============================================================================

🎯 Objectif du composant :
--------------------------
Ce provider React centralise toute la logique d’authentification de l’application.
Il permet à n’importe quel composant d’accéder facilement à :
- l’état de connexion (`isAuthenticated`)
- les informations utilisateur (`user`)
- les méthodes `login()`, `logout()` et `refreshSession()`

🔐 Architecture technique :
---------------------------
Le backend renvoie :
- un `accessToken` (souvent en cookie httpOnly, pour la sécurité)
- un `refreshToken` (dans le corps JSON de la réponse)

Le frontend :
- stocke le `refreshToken` dans localStorage
- laisse Axios gérer les expirations automatiques d’`accessToken`
  (grâce à l’intercepteur `api.interceptors.response`)

⚙️ Mécanisme complet :
----------------------
1. **Initialisation (useEffect)**  
   - On appelle `/auth/me` pour hydrater la session.  
   - Si l’`accessToken` est expiré mais qu’un `refreshToken` est encore valide,  
     l’intercepteur Axios rafraîchit automatiquement la session.

2. **Connexion (login)**  
   - POST `/auth/login` avec email et mot de passe.  
   - Le backend renvoie `{ user, refreshToken }`.  
   - Le front stocke le refreshToken et met à jour l’utilisateur.  
   - `skipAuthRefresh: true` empêche Axios de confondre un mauvais mot de passe (401)
     avec un token expiré.

3. **Déconnexion (logout)**  
   - Envoie le refreshToken à `/auth/logout` pour le révoquer côté serveur.  
   - Nettoie le localStorage et vide le contexte utilisateur.

4. **Rafraîchissement manuel (refreshSession)**  
   - POST `/auth/refresh` avec le refreshToken du localStorage.  
   - Le backend renvoie un nouvel accessToken + refreshToken (rotation).  
   - Mise à jour de l’état et du stockage local.  
   - `skipAuthRefresh: true` évite une boucle infinie en cas d’échec.

5. **Intercepteur Axios**
   - Sur toute requête qui échoue en `401 Unauthorized` :
     → appelle automatiquement `/auth/refresh` avec le refreshToken.  
     → rejoue la requête initiale une fois le refresh réussi.  
     → nettoie le localStorage si le refresh échoue (token expiré).

💡 Détails de sécurité :
------------------------
- Le `refreshToken` est sensible → stocké uniquement dans localStorage,
  jamais dans un cookie ni dans le state React.
- L’`accessToken` est géré par le backend (souvent cookie httpOnly).
- `skipAuthRefresh` évite les refresh automatiques indésirables.
- `_retry` évite les boucles infinies si `/auth/refresh` échoue plusieurs fois.

✅ En résumé :
--------------
- **login()** → crée une session et stocke le refreshToken  
- **logout()** → détruit proprement la session côté client et serveur  
- **refreshSession()** → prolonge la session sans redemander les identifiants  
- **auth/me** → vérifie la validité du token et récupère l’utilisateur  
- **Axios** → rafraîchit automatiquement les tokens en cas d’expiration  

Ce schéma reproduit un flux d’authentification professionnel moderne (JWT + rotation)
adapté aux apps React/TypeScript sécurisées.

============================================================================= */
