import  { HomePageContainer  } from "./style";
import { useEffect, useState } from "react";
import {
  fetchPosts,
  type Post,
  type PaginationMeta,
  createImageUrl,
} from "@/services/post.service";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import defaultCover from "@/assets/generic-post.jpg";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrMsg("");

      try {
        const res = await fetchPosts(page, 10);
        if (!cancelled) {
          setPosts(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setErrMsg("Impossible de charger les articles.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page]);

  function goPrev() {
    if (pagination?.hasPrevPage) {
      setPage((p) => p - 1);
    }
  }

  function goNext() {
    if (pagination?.hasNextPage) {
      setPage((p) => p + 1);
    }
  }

  return (
    <HomePageContainer>

      <Header />

      <header className="page-header">
        <div className="title-row">
          <h1>Derniers articles</h1>
          <span className="badge-count">{posts.length} posts</span>
        </div>

        {loading && (
          <div className="status-bar loading">
            Chargement en cours...
          </div>
        )}

        {!loading && errMsg && (
          <div className="status-bar error">{errMsg}</div>
        )}

        {!loading && !errMsg && posts.length === 0 && (
          <div className="status-bar empty">
            Aucun post disponible pour le moment.
          </div>
        )}
      </header>

      {!loading && !errMsg && posts.length > 0 && (
        <section className="post-list">
          {posts.map((post) => {
            // essaie de fabriquer une URL exploitable
            const fullCoverUrl = createImageUrl(post.coverUrl);
            // si pas d'image du tout -> fallback image locale
            const finalCover = fullCoverUrl || defaultCover;

            console.log({
              rawCoverUrl: post.coverUrl,
              computed: createImageUrl(post.coverUrl),
              used: createImageUrl(post.coverUrl) || defaultCover,
            });

            return (
              <article key={post.id} className="post-card">
                <Link to={`/posts/${post.id}`} className="post-card-inner">
                  <div
                    className="post-cover"
                    style={{
                      backgroundImage: `url(${finalCover})`,
                    }}
                  />

                  <div className="post-main">
                    <h2 className="post-title">{post.title}</h2>

                    <p className="post-content">{post.content}</p>

                    <div className="post-meta">
                      <div className="author-block">
                        <span className="author-name">
                          {post.author?.name || post.author?.email}
                        </span>
                        <span className="role-badge">
                          {post.author?.role === "ROLE_ADMIN"
                            ? "admin"
                            : "user"}
                        </span>
                      </div>

                      <div className="timestamps">
                        <span className="created">
                          Publié{" "}
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                        <span className="updated">
                          Maj{" "}
                          {new Date(post.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </section>
      )}

      <section className="pagination-bar">
        <div className="info">
          {pagination ? (
            <>
              Page {pagination.page} / {pagination.totalPages} ·{" "}
              {pagination.totalItems} posts
            </>
          ) : (
            <>-</>
          )}
        </div>

        <div className="actions">
          <button disabled={!pagination?.hasPrevPage} onClick={goPrev}>
            Précédent
          </button>
          <button disabled={!pagination?.hasNextPage} onClick={goNext}>
            Suivant
          </button>
        </div>
      </section>
      <Footer />

      {/*
      =============================================================================
      📘 RÉSUMÉ PÉDAGOGIQUE — src/pages/Home.tsx
      =============================================================================

      Objectif de la page :
      ---------------------
      - C'est la page d'accueil "/" publique.
      - Elle affiche les posts récents renvoyés par le backend (GET /posts).
      - Elle gère le chargement, les erreurs, l'état vide et la pagination.

      Architecture :
      --------------
      - La page utilise un SEUL styled-component (`HomePageContainer`).
      - À l'intérieur, tout le style est écrit via des classes imbriquées
        (.page-header, .post-card, .pagination-bar, etc.).
      - C'est exactement ta règle :
          ❗ on ne crée PAS de styled-component pour chaque sous-élément.
          ✅ on stylise UNIQUEMENT le container principal.

      Thème sombre BLEUTÉ :
      ---------------------
      - On ne met plus de couleurs en dur n'importe comment.
      - On lit tout dans `theme.colors.*` (background, surface, border, text...).
      - Le fond général est bleu nuit, les cartes sont bleu marine,
        les bordures sont bleu-gris, et les accents sont indigo.

      fetchPosts / services :
      -----------------------
      - On n'appelle pas axios directement ici.
      - On passe par `fetchPosts()` défini dans `src/services/posts.service.ts`.
      - Avantage : la page reste "logique UI" et ne mélange pas details HTTP.
        → super lisible pour les étudiants.

      Pagination :
      ------------
      - Le backend renvoie aussi un objet `pagination` :
        { page, totalPages, totalItems, hasNextPage, hasPrevPage, ... }
      - On mappe ça sur deux boutons :
        - "Précédent" -> setPage(page-1)
        - "Suivant"   -> setPage(page+1)
      - Les boutons sont disabled si pas dispo.

      Accessibilité visuelle :
      ------------------------
      - .post-content est tronquée à ~2 lignes via `-webkit-line-clamp`.
      - .role-badge montre si l'auteur est admin ou user.
      - On affiche les dates en `.toLocaleString()` pour avoir un rendu lisible.

      Résultat :
      ----------
      - Tu as une vraie home page production-like,
        sombre bleutée cohérente avec ton thème global,
        structurée selon TON organisation de projet :
          - axios config dans src/axios/axios.ts
          - appels réseau métiers dans src/services/
          - pages dans src/pages/
          - style via 1 styled-component racine + classes imbriquées type SASS.

      =============================================================================
      */}
    </HomePageContainer>
  );
}
