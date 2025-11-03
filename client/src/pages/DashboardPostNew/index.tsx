import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { DashboardPostNewPageContainer } from "./style";
import { api, extractAppErrorPayload } from "@/axios/axios";
import { useAuth } from "@/auth/AuthContext";

export default function DashboardPostNew() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // -----------------------------
  // Form state
  // -----------------------------
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  // -----------------------------
  // UI state
  // -----------------------------
  const [loading, setLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // -----------------------------
  // Handlers
  // -----------------------------
  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "title") setTitle(value);
    if (name === "content") setContent(value);
    if (name === "cover" && files && files.length > 0) {
      setFile(files[0]);
    }
  }

  // Validation minimale côté front
  function validateClient(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Titre obligatoire";
    if (!content.trim()) errors.content = "Contenu obligatoire";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setFieldErrors({});
    setServerError("");
    setSuccessMsg("");

    if (!validateClient()) return;

    try {
      setLoading(true);

      // --- Création du FormData ---
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (file) formData.append("cover", file);

      const res = await api.post("/posts/member/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status >= 200 && res.status < 300) {
        setSuccessMsg("Post créé avec succès ✔ Redirection en cours...");
        setTitle("");
        setContent("");
        setFile(null);

        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 800);
      }
    } catch (err) {
      const { message, fieldErrors: fe, traceId } = extractAppErrorPayload(err);
      setServerError(traceId ? `${message} — ref ${traceId}` : message);
      setFieldErrors((prev) => ({ ...prev, ...fe }));
    } finally {
      setLoading(false);
    }
  }

  // Garde-fou
  if (!isAuthenticated || !user) {
    return (
      <DashboardPostNewPageContainer>
        <Header />
        <section className="content-wrapper">
          <div className="status error">
            Vous devez être connecté pour créer un post.
          </div>
        </section>
        <Footer />
      </DashboardPostNewPageContainer>
    );
  }

  return (
    <DashboardPostNewPageContainer>
      <Header />

      <section className="content-wrapper">
        <header className="page-head">
          <div>
            <h1 className="page-title">Nouveau post</h1>
            <p className="page-subtitle">
              Rédige ton article et téléverse une image de couverture.
            </p>
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

        <form
          className="form-card"
          onSubmit={handleSubmit}
          noValidate
          encType="multipart/form-data"
        >
          {/* Champ titre */}
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
              placeholder="Mon super article"
              value={title}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          {/* Champ image (file upload) */}
          <div className="form-field">
            <label htmlFor="cover" className="form-label">
              <span>Image de couverture</span>
              {fieldErrors.cover && (
                <span className="error">{fieldErrors.cover}</span>
              )}
            </label>
            <input
              id="cover"
              name="cover"
              type="file"
              accept="image/*"
              className="file-input"
              onChange={handleInputChange}
              disabled={loading}
            />
            <p className="hint">
              Formats acceptés : JPEG, PNG, WEBP, GIF. Max 5 Mo.
            </p>
            {file && (
              <div className="preview">
                <img
                  src={URL.createObjectURL(file)}
                  alt="aperçu"
                  className="preview-img"
                />
              </div>
            )}
          </div>

          {/* Champ content */}
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
              placeholder="Écris ton article..."
              value={content}
              onChange={handleInputChange}
              disabled={loading}
              rows={8}
            />
          </div>

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
              {loading ? "Publication..." : "Publier le post"}
            </button>
          </div>
        </form>
      </section>

      <Footer />

      {/* =========================================================================
      📘 RÉSUMÉ PÉDAGOGIQUE — DashboardPostNewPage (upload image)
      =========================================================================
      - Champ image = <input type="file" accept="image/*" /> → plus d’URL manuelle
      - Envoi multipart/form-data via FormData
      - Backend : multer (upload.single("cover")) doit être en place
      - Aperçu direct de l’image avant upload
      - L’UX reste identique (erreurs, validations, redirection)
      ========================================================================= */}
    </DashboardPostNewPageContainer>
  );
}
