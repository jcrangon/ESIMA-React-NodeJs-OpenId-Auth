import { Link, useNavigate } from "react-router-dom";
import { HeaderContainer } from "./style";
import { useAuth } from "@/auth/AuthContext";
import { useCallback } from "react";

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/auth/login");
  }, [logout, navigate]);

  return (
    <HeaderContainer>
      <div className="inner">
        {/* Logo / Titre */}
        <Link to="/" className="brand">
          🜲 BlogX
        </Link>

        {/* Liens dynamiques selon connexion */}
        <nav className="nav-links">
          {!isAuthenticated ? (
            <>
              <Link to="/">Accueil</Link>
              <Link to="/auth/login">Connexion</Link>
              <Link to="/auth/register">Inscription</Link>
            </>
          ) : (
            <>
              <Link to="/">Accueil</Link>
              <Link to="/admin/dashboard">Dashboard</Link>
              <button onClick={handleLogout}>Déconnexion</button>
              <span className="user-info">
                {user?.name || user?.email}
                {user?.role === "ROLE_ADMIN" && (
                  <span className="badge">admin</span>
                )}
              </span>
            </>
          )}
        </nav>
      </div>
    </HeaderContainer>
  );
}

/* ============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — src/components/Header/index.tsx
-------------------------------------------------------------------------------

Objectif :
-----------
Fournir un en-tête commun à toute l’application avec des liens
dynamiques selon que l’utilisateur est connecté ou non.

Rôle du composant :
-------------------
- Visible sur toutes les pages (Home, Login, Dashboard, etc.)
- Interagit directement avec `useAuth()` pour savoir :
  ✅ si l’utilisateur est authentifié  
  ✅ comment le déconnecter proprement
- Après `logout()`, redirige vers `/auth/login`.

Structure JSX :
---------------
<header>
  <div className="inner">
    <Link className="brand" /> → logo ou nom du site
    <nav>
      ↳ Liens publics si pas connecté
      ↳ Liens privés + nom d’utilisateur si connecté
    </nav>
  </div>
</header>

Techniques React :
------------------
- `useAuth()` → récupère `isAuthenticated`, `user`, `logout`
- `useNavigate()` → redirige après la déconnexion
- `useCallback()` → évite de redéclarer `handleLogout` à chaque rendu

Bonnes pratiques :
------------------
✔ Aucun style inline → tout le CSS dans `style.ts`
✔ Thème sombre légèrement bleuté appliqué via `theme.colors.*`
✔ Boutons et liens cohérents avec la palette globale
✔ Badge "admin" affiché automatiquement selon le rôle
============================================================================ */
