import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { DashboardUserEditPageContainer } from "./style";

import { useAuth } from "@/auth/AuthContext";
import { api, extractAppErrorPayload } from "@/axios/axios";

type EditableUser = {
  id: number;
  email: string;
  name: string | null;
  role: "ROLE_USER" | "ROLE_ADMIN";
  createdAt: string;
  updatedAt: string;
};

export default function DashboardUserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user: me } = useAuth();

  // -----------------------------
  // UI / data state
  // -----------------------------
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [targetUser, setTargetUser] = useState<EditableUser | null>(null);

  // champ modifiable côté admin
  const [roleField, setRoleField] = useState<"ROLE_USER" | "ROLE_ADMIN">(
    "ROLE_USER"
  );

  // feedback
  const [serverError, setServerError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // -----------------------------
  // Charge les infos du user ciblé
  // -----------------------------
  useEffect(() => {
    if (!id) return;
    if (!isAuthenticated || !me) return;

    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      setServerError("");
      setSuccessMsg("");

      try {
        // GET /users/:id
        const res = await api.get(`/users/${id}`);
        const data = res.data?.user;

        if (!cancelled) {
          if (data) {
            setTargetUser(data);
            if (data.role === "ROLE_ADMIN" || data.role === "ROLE_USER") {
              setRoleField(data.role);
            }
          } else {
            setTargetUser(null);
            setServerError("Utilisateur introuvable.");
          }
        }
      } catch (err) {
        console.error(err);

        const { message, traceId } = extractAppErrorPayload(err);
        if (!cancelled) {
          setServerError(
            traceId
              ? `${message} — ref ${traceId}`
              : message || "Erreur lors du chargement de l'utilisateur."
          );
          setTargetUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated, me]);

  // -----------------------------
  // Restrictions d'accès front
  // -----------------------------
  if (!isAuthenticated || !me) {
    return (
      <DashboardUserEditPageContainer>
        <Header />
        <section className="content-wrapper">
          <div className="status error">
            Vous devez être connecté pour accéder à cette page.
          </div>

          <div className="solo-actions">
            <button
              className="back-btn"
              type="button"
              onClick={() => navigate("/admin/dashboard")}
            >
              ← Retour dashboard
            </button>
          </div>
        </section>
        <Footer />
      </DashboardUserEditPageContainer>
    );
  }

  if (me.role !== "ROLE_ADMIN") {
    return (
      <DashboardUserEditPageContainer>
        <Header />
        <section className="content-wrapper">
          <div className="status error">
            Accès refusé. Réservé aux administrateurs.
          </div>

          <div className="solo-actions">
            <button
              className="back-btn"
              type="button"
              onClick={() => navigate("/admin/dashboard")}
            >
              ← Retour dashboard
            </button>
          </div>
        </section>
        <Footer />
      </DashboardUserEditPageContainer>
    );
  }

  // -----------------------------
  // Handle submit (PATCH /users/:id/role)
  // -----------------------------
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!targetUser) return;

    setSaving(true);
    setServerError("");
    setSuccessMsg("");

    try {
      const res = await api.patch(
        `/users/${id}/role`,
        { role: roleField },
        {
          // pas de skipAuthRefresh ici : l'interceptor gère access_token expiré
        }
      );

      if (res.status >= 200 && res.status < 300) {
        const updatedUser = res.data?.user;
        setTargetUser(updatedUser || targetUser);
        setSuccessMsg("Rôle mis à jour ✔");

        // Si on a modifié SON PROPRE rôle (ex: admin → user),
        // on pourrait décider ici de naviguer / forcer logout, etc.
        // Pour l'instant, on reste simple : juste un message de succès.
      }
    } catch (err) {
      console.error(err);
      const { message, traceId } = extractAppErrorPayload(err);
      setServerError(
        traceId
          ? `${message} — ref ${traceId}`
          : message || "Impossible de mettre à jour le rôle."
      );
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // Chargement initial
  // -----------------------------
  if (loading) {
    return (
      <DashboardUserEditPageContainer>
        <Header />
        <section className="content-wrapper">
          <div className="status loading">
            Chargement de l'utilisateur…
          </div>
        </section>
        <Footer />
      </DashboardUserEditPageContainer>
    );
  }

  // -----------------------------
  // Pas trouvé / erreur grave
  // -----------------------------
  if (!targetUser) {
    return (
      <DashboardUserEditPageContainer>
        <Header />
        <section className="content-wrapper">
          <div className="status error">
            {serverError || "Utilisateur introuvable."}
          </div>

          <div className="solo-actions">
            <button
              className="back-btn"
              type="button"
              onClick={() => navigate("/admin/dashboard")}
            >
              ← Retour dashboard
            </button>
          </div>
        </section>
        <Footer />
      </DashboardUserEditPageContainer>
    );
  }

  // -----------------------------
  // Rendu principal
  // -----------------------------
  return (
    <DashboardUserEditPageContainer>
      <Header />

      <section className="content-wrapper">
        <header className="page-head">
          <div>
            <h1 className="page-title">
              Modifier l'utilisateur #{targetUser.id}
            </h1>
            <p className="page-subtitle">
              Mettre à jour le rôle de {targetUser.name || targetUser.email}.
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

        {/* Carte lecture seule infos actuelles */}
        <section className="user-card">
          <div className="row">
            <div className="label">Nom</div>
            <div className="value">{targetUser.name || "—"}</div>
          </div>

          <div className="row">
            <div className="label">Email</div>
            <div className="value">{targetUser.email}</div>
          </div>

          <div className="row">
            <div className="label">Rôle actuel</div>
            <div className="value">
              <span
                className={
                  targetUser.role === "ROLE_ADMIN"
                    ? "role-badge admin"
                    : "role-badge user"
                }
              >
                {targetUser.role === "ROLE_ADMIN" ? "admin" : "user"}
              </span>
            </div>
          </div>

          <div className="row">
            <div className="label">Créé le</div>
            <div className="value">
              {new Date(targetUser.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="row">
            <div className="label">Dernière MAJ</div>
            <div className="value">
              {new Date(targetUser.updatedAt).toLocaleString()}
            </div>
          </div>
        </section>

        {/* Formulaire de mise à jour du rôle */}
        <form className="edit-card" onSubmit={handleSubmit} noValidate>
          <h2 className="sub-title">Changer le rôle</h2>
          <p className="hint">
            Donner le rôle admin = accès avancé (gestion globale).
          </p>

          <div className="form-row">
            <label htmlFor="roleSelect" className="form-label">
              Nouveau rôle
            </label>

            <select
              id="roleSelect"
              className="role-select"
              value={roleField}
              disabled={saving}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setRoleField(e.target.value as "ROLE_USER" | "ROLE_ADMIN")
              }
            >
              <option value="ROLE_USER">Utilisateur standard</option>
              <option value="ROLE_ADMIN">Administrateur</option>
            </select>

            <button
              className="save-btn"
              type="submit"
              disabled={saving}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>

      <Footer />

      {/* =========================================================================
      📘 RÉSUMÉ PÉDAGOGIQUE — DashboardUserEdit
      =========================================================================
      Objectif :
      - Permettre à un admin de modifier le rôle d'un utilisateur ciblé.

      Flux :
      1. On lit l'ID depuis l'URL (useParams).
      2. On charge l'utilisateur via GET /users/:id.
      3. On stocke localement son rôle dans roleField.
      4. Quand l'admin clique "Enregistrer", on envoie PATCH /users/:id/role
         avec { role: roleField }.
      5. Si OK → message de succès + mise à jour locale.

      Sécurité front :
      - Si l'utilisateur courant n'est pas authentifié
        ou pas ROLE_ADMIN → on bloque l'accès.
      - Ça n'est PAS une sécurité suffisante en production,
        mais ça évite une UX bizarre côté front.
      - Le backend reste la vraie police : requireAuth + requireAdmin.

      Gestion d'erreur :
      - On passe toutes les erreurs serveur dans extractAppErrorPayload()
        pour avoir un message clair + traceId support.
      - On affiche ces infos dans .server-error.

      Style :
      - Respect strict de TES règles :
        • un seul styled-component racine DashboardUserEditPageContainer
        • toutes les classes (page-head, user-card, edit-card...) imbriquées dedans
        • couleurs = theme.colors.* (fond sombre bleuté, accents indigo)
      ========================================================================= */}
    </DashboardUserEditPageContainer>
  );
}
