// src/pages/DashboardPage/index.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DashboardPageContainer } from "./style";

import { useAuth } from "@/auth/AuthContext";

import {
  fetchMyPosts,
  deleteMyPost,
  fetchAllUsersForAdmin,
  type UserPost,
  type AdminUserSummary,
} from "@/services/dashboard.service";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mes posts
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(true);
  const [postsError, setPostsError] = useState<string>("");

  // Utilisateurs (admin)
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string>("");

  // Feedback global (après suppression, etc.)
  const [actionMsg, setActionMsg] = useState<string>("");

  // -------------------------------------------------
  // Charger MES POSTS
  // -------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      if (authLoading) return;
      if (!isAuthenticated || !user) return;

      setPostsLoading(true);
      setPostsError("");
      setActionMsg("");

      try {
        const list = await fetchMyPosts(); // GET /posts/member/list
        if (!cancelled) {
          setPosts(list ?? []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setPostsError("Impossible de récupérer vos articles.");
          setPosts([]);
        }
      } finally {
        if (!cancelled) {
          setPostsLoading(false);
        }
      }
    }

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, user]);

  // -------------------------------------------------
  // Charger UTILISATEURS si ADMIN
  // -------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      if (authLoading) return;
      if (!isAuthenticated || !user) return;
      if (user.role !== "ROLE_ADMIN") return;

      setUsersLoading(true);
      setUsersError("");
      setActionMsg("");

      try {
        const list = await fetchAllUsersForAdmin(1, 20); // GET /users?page=1&limit=20
        if (!cancelled) {
          setUsers(list ?? []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setUsersError("Impossible de charger les utilisateurs.");
          setUsers([]);
        }
      } finally {
        if (!cancelled) {
          setUsersLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, user]);

  // -------------------------------------------------
  // ACTION: supprimer un post courant
  // -------------------------------------------------
  async function handleDeletePost(id: number) {
    const ok = confirm(
      "Supprimer définitivement cet article ? Cette action est irréversible."
    );
    if (!ok) return;

    try {
      await deleteMyPost(id); // DELETE /posts/member/delete/:id
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setActionMsg(`Article #${id} supprimé ✔`);
    } catch (err) {
      console.error(err);
      setActionMsg("Erreur lors de la suppression de l'article.");
    }
  }

  // -------------------------------------------------
  // Rendu selon l'état auth
  // -------------------------------------------------

  if (authLoading) {
    return (
      <DashboardPageContainer>
        <Header />
        <section className="dashboard-wrapper">
          <div className="status loading">
            Vérification de votre session...
          </div>
        </section>
        <Footer />
      </DashboardPageContainer>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <DashboardPageContainer>
        <Header />
        <section className="dashboard-wrapper">
          <div className="status error">
            Vous devez être connecté pour accéder au tableau de bord.
          </div>
        </section>
        <Footer />
      </DashboardPageContainer>
    );
  }

  // posts et users sont déjà des [] par défaut
  const safePosts = posts;
  const safeUsers = users;

  return (
    <DashboardPageContainer>
      <Header />

      <section className="dashboard-wrapper">
        {/* ------------------------------------------------------------------ */}
        {/* 1. Carte session utilisateur                                       */}
        {/* ------------------------------------------------------------------ */}
        <section className="session-card">
          <div className="session-header">
            <h1 className="session-title">Tableau de bord</h1>

            <div className="session-role">
              Connecté en tant que{" "}
              <span className="name">{user.name || user.email}</span>
              <span
                className={
                  user.role === "ROLE_ADMIN"
                    ? "role-badge admin"
                    : "role-badge user"
                }
              >
                {user.role === "ROLE_ADMIN" ? "admin" : "user"}
              </span>
            </div>
          </div>

          <div className="session-meta">
            <span>
              Compte créé :{" "}
              <strong>
                {new Date(user.createdAt).toLocaleString()}
              </strong>
            </span>

            <span>
              Dernière MAJ profil :{" "}
              <strong>
                {new Date(user.updatedAt).toLocaleString()}
              </strong>
            </span>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 2. Feedback global des actions CRUD                                */}
        {/* ------------------------------------------------------------------ */}
        {actionMsg && (
          <div className="action-feedback">{actionMsg}</div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 3. Tableau MES POSTS                                              */}
        {/* ------------------------------------------------------------------ */}
        <section className="panel-card">
          <div className="panel-head">
            <h2 className="panel-title">Mes articles</h2>

            <button
              className="panel-new-btn"
              onClick={() => {
                // vers la page de création d'article
                // à créer ensuite : /dashboard/posts/new
                navigate("/admin/dashboard/posts/new");
              }}
            >
              + Nouveau post
            </button>
          </div>

          {postsLoading && (
            <div className="status loading">
              Chargement de vos articles...
            </div>
          )}

          {!postsLoading && postsError && (
            <div className="status error">{postsError}</div>
          )}

          {!postsLoading &&
            !postsError &&
            safePosts.length === 0 && (
              <div className="status empty">
                Aucun article pour l’instant.
              </div>
            )}

          {!postsLoading &&
            !postsError &&
            safePosts.length > 0 && (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Titre</th>
                      <th>Créé le</th>
                      <th>Maj le</th>
                      <th className="th-actions">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {safePosts.map((p) => (
                      <tr key={p.id}>
                        <td className="col-id">#{p.id}</td>
                        <td className="col-title">{p.title}</td>
                        <td className="col-date">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                        <td className="col-date">
                          {new Date(p.updatedAt).toLocaleString()}
                        </td>
                        <td className="col-actions">
                          <button
                            className="mini-btn edit"
                            onClick={() =>
                              navigate(`/admin/dashboard/posts/${p.id}/edit`)
                            }
                          >
                            Modifier
                          </button>

                          <button
                            className="mini-btn delete"
                            onClick={() => handleDeletePost(p.id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* 4. Tableau UTILISATEURS (ADMIN ONLY)                               */}
        {/* ------------------------------------------------------------------ */}
        {user.role === "ROLE_ADMIN" && (
          <section className="panel-card">
            <div className="panel-head">
              <h2 className="panel-title">Utilisateurs</h2>

              <button
                className="panel-new-btn"
                onClick={() => {
                  // vers la page de création utilisateur admin
                  navigate("/admin/dashboard/users/new");
                }}
              >
                + Nouvel utilisateur
              </button>
            </div>

            {usersLoading && (
              <div className="status loading">
                Chargement des utilisateurs...
              </div>
            )}

            {!usersLoading && usersError && (
              <div className="status error">{usersError}</div>
            )}

            {!usersLoading &&
              !usersError &&
              safeUsers.length === 0 && (
                <div className="status empty">
                  Aucun utilisateur trouvé.
                </div>
              )}

            {!usersLoading &&
              !usersError &&
              safeUsers.length > 0 && (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom / Email</th>
                        <th>Rôle</th>
                        <th>Créé le</th>
                        <th>Maj le</th>
                        <th className="th-actions">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {safeUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="col-id">#{u.id}</td>

                          <td className="col-user">
                            <div className="usr-ident">
                              <span className="usr-name">
                                {u.name || u.email}
                              </span>
                              <span className="usr-email">
                                {u.email}
                              </span>
                            </div>
                          </td>

                          <td className="col-role">
                            <span
                              className={
                                u.role === "ROLE_ADMIN"
                                  ? "role-badge admin"
                                  : "role-badge user"
                              }
                            >
                              {u.role === "ROLE_ADMIN"
                                ? "admin"
                                : "user"}
                            </span>
                          </td>

                          <td className="col-date">
                            {new Date(u.createdAt).toLocaleString()}
                          </td>

                          <td className="col-date">
                            {new Date(u.updatedAt).toLocaleString()}
                          </td>

                          <td className="col-actions">

                            <button
                              className="mini-btn edit"
                              onClick={() =>
                                navigate(
                                  `/admin/dashboard/users/${u.id}/edit`
                                )
                              }
                            >
                              Modifier
                            </button>

                            <button
                              className="mini-btn delete"
                              onClick={() => {
                                // TODO: à implémenter (DELETE /users/:id)
                                alert(
                                  "TODO: suppression utilisateur côté admin"
                                );
                              }}
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </section>
        )}
      </section>

      <Footer />

      {/* =========================================================================
      📘 RÉSUMÉ PÉDAGOGIQUE — DashboardPage
      =========================================================================
      - Dashboard = vue d’admin légère :
        • tableau de MES posts (toujours visible si connecté)
        • tableau des utilisateurs (visible UNIQUEMENT si ROLE_ADMIN)
      - Chaque tableau a :
        • un bouton global "Nouveau ..."
        • des boutons ligne par ligne "Modifier" / "Supprimer"
      - Aucune création/modification n’est faite inline ici.
        On redirige vers /dashboard/posts/new, /dashboard/posts/:id/edit,
        /dashboard/users/:id/edit, etc.
      - Les services (`dashboard.service.ts`) masquent les vraies routes backend :
        /posts/member/list, /posts/member/delete/:id, /users...
      - L’intercepteur axios gère les 401 expirés via /auth/refresh tout seul.
      ========================================================================= */}
    </DashboardPageContainer>
  );
}
