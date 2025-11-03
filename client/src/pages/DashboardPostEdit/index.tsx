// src/pages/DashboardPostEdit/index.tsx
import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { DashboardPostEditPageContainer } from "./style";
import { api, extractAppErrorPayload } from "@/axios/axios";
import { useAuth } from "@/auth/AuthContext";
import defaultCover from "@/assets/generic-post.jpg";

interface PostDetail {
  id: number;
  title: string;
  content: string;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPostEdit() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // -----------------------------
  // Loading + données du post
  // -----------------------------
  const [loading, setLoading] = useState<boolean>(true);
  const [post, setPost] = useState<PostDetail | null>(null);

  // -----------------------------
  // State du formulaire en édition
  // -----------------------------
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // Nouveau: URL externe manuelle OU réutilisation existante
  const [coverUrlText, setCoverUrlText] = useState<string>("");

  // Nouveau: upload fichier
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // -----------------------------
  // UI Feedback
  // -----------------------------
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // -------------------------------------------------
  // Charger les infos du post existant au montage
  // -------------------------------------------------
  useEffect(() => {
    if (!id) return;

    async function loadPost() {
      try {
        const res = await api.get(`/posts/${id}`);
        const data = res.data.post;

        setPost(data);

        // Préremplir le formulaire avec les valeurs actuelles
        setTitle(data.title || "");
        setContent(data.content || "");

        // Important :
        // - Si le post a déjà une image stockée localement (/uploads/xxx.jpg),
        //   on met cette valeur dans coverUrlText pour l'afficher et pouvoir la remplacer.
        // - Si pas d'image → coverUrlText reste "".
        setCoverUrlText(data.coverUrl || "");
      } catch (err) {
        console.error(err);
        setServerError("Impossible de charger cet article.");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [id]);

  // -------------------------------------------------
  // Handlers de formulaire
  // -------------------------------------------------
  function handleTextChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    const { name, value } = e.target;
    if (name === "title") setTitle(value);
    if (name === "content") setContent(value);
    if (name === "coverUrlText") setCoverUrlText(value);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>): void {
    if (e.target.files && e.target.files.length > 0) {
      setCoverFile(e.target.files[0]);
    }
  }

  // -------------------------------------------------
  // Validation minimale côté client
  // -------------------------------------------------
  function validateClient(): boolean {
    const newErrs: Record<string, string> = {};

    if (!title.trim()) newErrs.title = "Titre obligatoire";
    if (!content.trim()) newErrs.content = "Contenu obligatoire";

    // Pas obligatoire, mais si coverUrlText est rempli, on peut prévenir
    // sur un format obviously cassé (pas d'espace, doit ressembler à une URL ou /uploads/...).
    if (coverUrlText.trim()) {
      const looksLikeUrl =
        coverUrlText.startsWith("http://") ||
        coverUrlText.startsWith("https://") ||
        coverUrlText.startsWith("/uploads/");
      if (!looksLikeUrl) {
        newErrs.coverUrlText = "URL invalide (http(s):// ou /uploads/...)";
      }
    }

    setFieldErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  }

  // -------------------------------------------------
  // Soumission du formulaire (PATCH)
  // -------------------------------------------------
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!validateClient()) return;

    setServerError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      // On envoie en multipart/form-data
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("content", content.trim());

      // Cas 1 : l'utilisateur upload un NOUVEAU fichier
      // -> le backend prendra req.file et utilisera ça en priorité
      if (coverFile) {
        formData.append("cover", coverFile);
      }

      // Cas 2 : pas de fichier uploadé MAIS on a un texte dans coverUrlText
      // -> le backend prendra req.body.coverUrl
      if (!coverFile && coverUrlText.trim()) {
        formData.append("coverUrl", coverUrlText.trim());
      }

      const res = await api.patch(
        `/posts/member/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status >= 200 && res.status < 300) {
        setSuccessMsg("Article mis à jour ✔ Redirection en cours...");
        setTimeout(() => navigate("/admin/dashboard"), 1000);
      }
    } catch (err) {
      const { message, fieldErrors: fe, traceId } = extractAppErrorPayload(err);

      setServerError(traceId ? `${message} — ref ${traceId}` : message);

      setFieldErrors((prev) => ({
        ...prev,
        ...fe,
      }));
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------
  // Garde d'accès : pas connecté
  // -------------------------------------------------
  if (!isAuthenticated || !user) {
    return (
      <DashboardPostEditPageContainer>
        <Header />
        <section className="content-wrapper">
          <div className="status error">
            Vous devez être connecté pour modifier un post.
          </div>
        </section>
        <Footer />
      </DashboardPostEditPageContainer>
    );
  }

  // -------------------------------------------------
  // États de chargement / erreur / not found
  // -------------------------------------------------
  if (loading) {
    return (
      <DashboardPostEditPageContainer>
        <Header />
        <section className="content-wrapper">
          <div className="status loading">Chargement du post...</div>
        </section>
        <Footer />
      </DashboardPostEditPageContainer>
    );
  }

  if (!post) {
    return (
      <DashboardPostEditPageContainer>
        <Header />
        <section className="content-wrapper">
          <div className="status error">Post introuvable.</div>
        </section>
        <Footer />
      </DashboardPostEditPageContainer>
    );
  }

  // -------------------------------------------------
  // Rendu principal
  // -------------------------------------------------
  return (
    <DashboardPostEditPageContainer>
      <Header />

      <section className="content-wrapper">
        <header className="page-head">
          <div>
            <h1 className="page-title">Modifier le post</h1>
            <p className="page-subtitle">ID #{post.id}</p>
          </div>

          <button
            className="back-btn"
            type="button"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Retour dashboard
          </button>
        </header>

        {(serverError || successMsg) && (
          <div className="feedback-block">
            {serverError && (
              <p className="server-error">{serverError}</p>
            )}
            {successMsg && (
              <p className="server-success">{successMsg}</p>
            )}
          </div>
        )}

        <form className="form-card" onSubmit={handleSubmit} noValidate>
          {/* Titre */}
          <div className="form-field">
            <label htmlFor="title" className="form-label">
              <span>Titre *</span>
              {fieldErrors.title && (
                <span className="error">{fieldErrors.title}</span>
              )}
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="text-input"
              value={title}
              onChange={handleTextChange}
              disabled={loading}
            />
          </div>

          {/* Image actuelle + upload fichier */}
          <div className="form-field">
            <label htmlFor="cover" className="form-label">
              Image de couverture actuelle
            </label>

            <div className="cover-preview">
              <img
                src={
                  post.coverUrl
                    ? // si coverUrl commence par http(s) on l'utilise telle quelle
                      post.coverUrl.startsWith("http")
                      ? post.coverUrl
                      : `${api.defaults.baseURL}${post.coverUrl}`
                    : defaultCover
                }
                alt="cover actuelle"
              />
            </div>

            <input
              id="cover"
              name="cover"
              type="file"
              accept="image/*"
              className="file-input"
              onChange={handleFileChange}
              disabled={loading}
            />
            <p className="hint">
              Choisis un nouveau fichier pour remplacer l’image.
            </p>
          </div>

          {/* URL alternative /uploads/... OU http(s):// */}
          <div className="form-field">
            <label htmlFor="coverUrlText" className="form-label">
              <span>URL d’image (optionnel)</span>
              {fieldErrors.coverUrlText && (
                <span className="error">{fieldErrors.coverUrlText}</span>
              )}
            </label>

            <input
              id="coverUrlText"
              name="coverUrlText"
              type="text"
              className="text-input"
              placeholder="https://exemple.com/image.jpg ou /uploads/xxx.png"
              value={coverUrlText}
              onChange={handleTextChange}
              disabled={loading}
            />

            <p className="hint">
              • Laisse vide pour ne pas changer l’image.
              <br />
              • Remplis ce champ pour forcer une nouvelle URL d’image SANS
              upload.
              <br />
              • Si tu fournis à la fois un fichier ET une URL, le FICHIER gagne
              (priorité côté backend).
            </p>
          </div>

          {/* Contenu */}
          <div className="form-field">
            <label htmlFor="content" className="form-label">
              <span>Contenu *</span>
              {fieldErrors.content && (
                <span className="error">{fieldErrors.content}</span>
              )}
            </label>

            <textarea
              id="content"
              name="content"
              className="textarea-input"
              rows={8}
              value={content}
              onChange={handleTextChange}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="actions-row">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/admin/dashboard")}
              disabled={loading}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </section>

      <Footer />

      {/*
      =============================================================================
      📘 RÉSUMÉ PÉDAGOGIQUE — DashboardPostEditPage/index.tsx
      =============================================================================

      🎯 Objectif de la page
      ----------------------
      - Permettre à l'utilisateur connecté d'éditer un post existant.
      - Charger les valeurs actuelles du post (title, content, coverUrl).
      - Envoyer les modifications au backend via PATCH /posts/member/update/:id.
      - Gérer l'image de couverture de façon flexible.

      🖼 Gestion d'image : 3 modes possibles
      -------------------------------------
      1. Upload d'un NOUVEAU fichier via <input type="file" name="cover" /> :
         → Multer remplit req.file côté backend.
         → Le contrôleur fait:
              dataToUpdate.coverUrl = "/uploads/<nouveauNom>.png"

      2. Fournir une URL manuelle dans le champ texte "URL d’image"
         (coverUrlText) sans uploader de fichier :
         → On ajoute formData.append("coverUrl", coverUrlText)
         → Le contrôleur voit req.body.coverUrl et fait:
              dataToUpdate.coverUrl = req.body.coverUrl

      3. Ne rien toucher :
         → Pas de fichier "cover"
         → coverUrlText vide
         → Le contrôleur ne modifie pas coverUrl en base.

      👉 C'est exactement pourquoi, dans le backend :
         if (req.file) { ... } else if (req.body.coverUrl) { ... }

         Le fichier a priorité sur l'URL texte.

      🔐 Sécurité / accès
      -------------------
      - On vérifie isAuthenticated && user.
      - Si pas connecté : on n'affiche pas le formulaire.
      - Le backend, lui, vérifiera aussi la propriété du post
        (l'auteur ou un admin peut modifier).

      🔄 Chargement initial
      ---------------------
      - On GET /posts/:id (route publique) pour préremplir le formulaire.
        (Dans un monde prod, tu pourrais vouloir une version /member/:id
         qui fail si ce n'est pas ton post, mais ici tu réutilises le contrôleur public.)

      ❗ Important UX
      ---------------
      - On montre un aperçu de l'image actuelle du post (`post.coverUrl`).
        • Si coverUrl commence par "http", on l'utilise tel quel.
        • Sinon on la préfixe par api.defaults.baseURL pour cibler /uploads/... du backend.
        • Sinon fallback sur une image générique locale.

      - On affiche les erreurs backend exactement comme sur Register/NewPost :
        serverError (bannière globale) + fieldErrors[field] (inline sous les labels).

      🧼 Lisibilité code
      ------------------
      - Un seul styled-component racine: DashboardPostEditPageContainer.
      - Le style détaillé vit dans style.ts, avec palette du theme sombre bleuté.
      - La logique réseau reste ici, mais c’est très simple:
          - GET pour préremplir
          - PATCH via FormData

      Résultat :
      ----------
      Tu as un écran d’édition de post industriel :
      • Prérempli
      • Gère l’upload
      • Gère les URL distantes
      • Gère les erreurs backend normalisées
      • Respecte ton thème
      =============================================================================
      */}
    </DashboardPostEditPageContainer>
  );
}
