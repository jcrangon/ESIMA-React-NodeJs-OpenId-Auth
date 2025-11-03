// src/pages/PostPage/index.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PostPageContainer } from "./style";
import { createImageUrl, fetchPostById } from "@/services/post.service";
import type { Post } from "@/services/post.service";
import defaultCover from "@/assets/generic-post.jpg";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setErrMsg("Article introuvable (id manquant).");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrMsg("");

      try {
        const data = await fetchPostById(Number(id));
        if (!cancelled) {
          setPost(data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setErrMsg("Impossible de charger cet article.");
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
  }, [id]);

  let coverSrc = post?.coverUrl ? post.coverUrl : defaultCover;
  if (post?.coverUrl && post.coverUrl.indexOf("http") <= 0) {
    coverSrc = createImageUrl(post.coverUrl) || defaultCover;
  }

  return (
    <PostPageContainer>
      <Header />

      <section className="article-wrapper">
        {loading && (
          <div className="status loading">Chargement de l'article…</div>
        )}

        {!loading && errMsg && (
          <div className="status error">{errMsg}</div>
        )}

        {!loading && !errMsg && !post && (
          <div className="status empty">Article introuvable.</div>
        )}

        {!loading && !errMsg && post && (
          <article className="article-card">
            {/* image de couverture */}
            <div
              className="article-cover"
              style={{
                backgroundImage: `url(${coverSrc})`,
              }}
            />

            <div className="article-main">
              <header className="article-head">
                <h1 className="article-title">{post.title}</h1>

                <div className="meta-block">
                  <div className="author-side">
                    <span className="author-name">
                      {post.author?.name || post.author?.email}
                    </span>
                    <span className="role-badge">
                      {post.author?.role === "ROLE_ADMIN"
                        ? "admin"
                        : "user"}
                    </span>
                  </div>

                  <div className="time-side">
                    <span className="created">
                      Publié{" "}
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                    <span className="updated">
                      Maj{" "}
                      {new Date(post.updatedAt).toLocaleString()}
                    </span>
                    <span className="post-id"># {post.id}</span>
                  </div>
                </div>
              </header>

              <section className="article-body">
                <p className="article-content">
                  {post.content}
                </p>
              </section>
            </div>
          </article>
        )}

        <div className="back-row">
          <Link to="/" className="back-link">
            ← Retour aux articles
          </Link>
        </div>
      </section>

      <Footer />

      {/*
      =============================================================================
      📘 RÉSUMÉ PÉDAGOGIQUE — src/pages/PostPage/index.tsx
      =============================================================================

      But de cette page :
      -------------------
      - Afficher le détail d'un seul post (titre, contenu complet, auteur,
        rôle auteur, dates de création / mise à jour, id).
      - C'est la vue "article individuel" accessible via /posts/:id.

      Récupération de l'id :
      ----------------------
      - On utilise `useParams()` de react-router-dom.
      - const { id } = useParams<{ id: string }>();
      - On convertit ensuite en Number(id) pour l'appel API.

      Chargement des données :
      ------------------------
      - On appelle `fetchPostById(id)` (service dédié dans services/post.service.ts),
        au lieu d'appeler axios direct ici.
      - On gère trois états :
        • loading
        • erreur (errMsg)
        • post introuvable (= pas de data)

      Image de couverture :
      ---------------------
      - On veut toujours une image visuelle en haut de la carte.
      - Si le post a `coverUrl`, on l'utilise.
      - Sinon on affiche une image fallback générique qu'on a placée dans src/assets.
        → ça évite les cartes "cassées" ou vides.

      Métadonnées affichées :
      -----------------------
      - Auteur (name ou email) + badge de rôle (admin / user)
      - Dates :
        • createdAt -> "Publié ..."
        • updatedAt -> "Maj ..."
      - L'id du post (#123)
      - On formate les dates avec .toLocaleString() pour un rendu lisible humainement.

      Style & thème :
      ---------------
      - Comme dans tout le projet :
        • 1 styled-component racine : `PostPageContainer`
        • le reste est géré par des classes imbriquées (.article-card, .meta-block, etc.)
      - Palette sombre bleutée cohérente avec le reste de l'app.
      - Carte floutée/vitrée, bords légèrement bleus, glow sur les accents.

      Retour arrière :
      ----------------
      - On propose un lien "← Retour aux articles" en bas de page.
      - C'est un `<Link>` React Router vers "/".
      - On évite les window.history.go(-1) pour rester prévisible.

      Intégration routage :
      ---------------------
      - Ta config de routes doit avoir quelque chose comme :
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostPage />} />

      Résultat :
      ----------
      - Tu as maintenant un vrai flux :
        Home (liste paginée)
          -> clic sur une carte
            -> page détail post
      - C'est le pattern standard blog / actualités / knowledge base.
      =============================================================================
      */}
    </PostPageContainer>
  );
}
