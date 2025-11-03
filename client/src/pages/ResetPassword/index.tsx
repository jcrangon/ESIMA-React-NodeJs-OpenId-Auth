import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResetPasswordPageContainer } from "./style";
import { api, extractAppErrorPayload } from "@/axios/axios";
import { useAuth } from "@/auth/AuthContext";



export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverMsg, setServerMsg] = useState<string>("");

  const { adoptSessionFromReset } = useAuth();

  function validateClientSide() {
    const errs: Record<string, string> = {};

    if (!password || password.length < 8) {
      errs.password = "Minimum 8 caractères";
    }
    if (confirmPassword !== password) {
      errs.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!token) {
      errs.token = "Lien invalide ou expiré";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setServerMsg("");

    if (!validateClientSide()) return;

    try {
      setLoading(true);

      // Appel backend:
      // POST /auth/reset-password
      // body: { token, password, confirmPassword }
      //
      // IMPORTANT:
      // Ton backend renvoie déjà:
      // - user
      // - refreshToken
      // - setAccessCookie(res, accessToken) côté serveur
      //
      const { data } = await api.post(
        "/auth/reset-password",
        {
          token,
          password,
          confirmPassword,
        },
        { skipAuthRefresh: true }
      );

      // On récupère le refreshToken renvoyé par le backend, et l'utilisateur.
      // On va simuler ce que fait login() normalement :
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      // maintenant on veut mettre à jour le contexte auth.
      // on ne peut pas appeler login() directement car login() appelle /auth/login,
      // mais on peut manuellement faire comme si :
      // -> le Provider devrait idéalement exposer un petit setter interne.
      // Comme tu n'as pas encore de setUser() dans le hook, je propose qu'on
      // ajoute une méthode `adoptSessionAfterReset()` dans l'AuthProvider.

      if (data?.user) {
        adoptSessionFromReset(data.user, data.refreshToken);
      }

      setServerMsg("Mot de passe réinitialisé. Redirection...");

      // Redirection vers la home ou dashboard:
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      const { message, fieldErrors: fe } = extractAppErrorPayload(err);
      if (fe) setFieldErrors(fe);
      setServerMsg(message || "Impossible de réinitialiser le mot de passe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResetPasswordPageContainer>
      <div className="card">
        <h1 className="title">Nouveau mot de passe</h1>
        <p className="subtitle">
          Choisis un nouveau mot de passe pour ton compte.
        </p>

        {!token && (
          <p className="warning">
            Le lien de réinitialisation est invalide ou expiré.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Password */}
          <div className="field">
            <label htmlFor="password">
              <span>Nouveau mot de passe</span>
              {fieldErrors.password && (
                <span className="error">{fieldErrors.password}</span>
              )}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || !token}
            />
          </div>

          {/* Confirm */}
          <div className="field">
            <label htmlFor="confirmPassword">
              <span>Confirmer le mot de passe</span>
              {fieldErrors.confirmPassword && (
                <span className="error">{fieldErrors.confirmPassword}</span>
              )}
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || !token}
            />
          </div>

          {fieldErrors.token && (
            <p className="error-block">{fieldErrors.token}</p>
          )}

          {serverMsg && <p className="server-msg">{serverMsg}</p>}

          <div className="actions">
            <button
              className="submit-btn"
              type="submit"
              disabled={loading || !token}
            >
              {loading ? "Validation..." : "Valider le nouveau mot de passe"}
            </button>

            <button
              className="cancel-btn"
              type="button"
              onClick={() => navigate("/auth/login")}
              disabled={loading}
            >
              Retour connexion
            </button>
          </div>
        </form>
      </div>
    </ResetPasswordPageContainer>
  );
}

/*
RÉSUMÉ PÉDAGOGIQUE
- Page publique: accessible via un lien e-mail contenant ?token=...
- Elle envoie password + confirmPassword + token vers /auth/reset-password.
- Le backend :
  - Vérifie le token reset
  - Met à jour le mot de passe
  - Révoque toutes les anciennes sessions
  - Crée une nouvelle session (access + refresh)
- Donc après reset on peut connecter automatiquement l’utilisateur.
*/
