// src/auth/AuthContext.tsx
import { createContext, useContext } from "react";
import type { AuthUser } from "./AuthProvider";

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  adoptSessionFromReset: (user: AuthUser, refreshToken?: string) => void;
};

// Contexte initial "vide" (on met undefined pour pouvoir détecter l'absence de Provider)
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Hook pratique à importer partout dans l'app
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Ça veut dire que le composant qui appelle useAuth()
    // n'est pas dans <AuthProvider> ... </AuthProvider>.
    throw new Error("useAuth() must be used inside <AuthProvider>");
  }
  return ctx;
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — src/auth/AuthContext.tsx
===============================================================================

Rôle du contexte :
------------------
`AuthContext` sert de canal global pour partager l'état d'authentification
dans toute l'application React (user connecté, chargement, etc.)
sans avoir à passer des props à chaque niveau.

Ce que contient AuthContext :
-----------------------------
- user : les infos utilisateur { id, email, name, role } ou null si pas connecté
- loading : true tant qu'on ne sait pas encore si l'utilisateur est loggé
- isAuthenticated : booléen dérivé (!!user)
- login(email, password, rememberMe?) : déclenche le flux de connexion (/auth/login)
- logout() : déclenche la déconnexion propre (/auth/logout + cleanup local)
- refreshSession() : tente d'obtenir un nouveau access_token via /auth/refresh

Pourquoi `createContext<AuthContextValue | undefined>(undefined)` ?
-------------------------------------------------------------------
On initialise le contexte avec `undefined` volontairement.
Comme ça, dans le hook `useAuth()`, on peut détecter si on est en dehors du Provider.

Regarde :

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

→ Ça évite des bugs "silencieux" où tu lis `useAuth()` alors que
tu as oublié d'entourer ton app avec `<AuthProvider>` dans `main.tsx`.

Exemple d'utilisation :
-----------------------
1. Tu entoures l'app dans main.tsx :

  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>

2. Depuis n'importe quel composant/page :

  import { useAuth } from "@/auth/AuthContext";

  export default function DashboardHeader() {
    const { user, isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
      return <div className="warning">Non connecté</div>;
    }

    return (
      <header>
        <span>Bonjour {user.name ?? user.email}</span>
        <button onClick={logout}>Se déconnecter</button>
      </header>
    );
  }

Pourquoi c'est pro ?
--------------------
- `AuthProvider` gère les talks avec le backend (login/logout/refresh/me).
- `AuthContext` expose ces infos au reste du front.
- `useAuth()` te donne un accès ultra simple, sans rebalancer l'implémentation.

C'est le pattern standard pour les apps React sérieuses
avec authentification basée sur cookie httpOnly + refreshToken persistant.

============================================================================= */
