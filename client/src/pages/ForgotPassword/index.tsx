import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordPageContainer } from "./style";
import { api } from "@/axios/axios";
import { extractAppErrorPayload } from "@/axios/axios";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // message global renvoyé à l'utilisateur
  const [serverMsg, setServerMsg] = useState<string>("");

  // erreur spécifique champ email
  const [emailError, setEmailError] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setServerMsg("");

    if (!email.trim()) {
      setEmailError("Email obligatoire");
      return;
    }

    try {
      setLoading(true);

      // Appel backend :
      // POST /auth/forgot-password
      // body: { email }
      await api.post(
        "/auth/forgot-password",
        { email },
        { skipAuthRefresh: true }
      );

      // Réponse volontairement générique côté backend :
      // "Si un compte existe..."
      setServerMsg(
        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
      );
    } catch (err) {
      // Ici normalement le backend répond toujours 200,
      // mais on reste safe si un bug survient
      const { message } = extractAppErrorPayload(err);
      setServerMsg(message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ForgotPasswordPageContainer>
      <div className="card">
        <h1 className="title">Réinitialisation du mot de passe</h1>
        <p className="subtitle">
          Entre l'adresse e-mail associée à ton compte.
          <br />
          Si elle existe, tu recevras un lien de réinitialisation.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">
              <span>Email</span>
              {emailError && <span className="error">{emailError}</span>}
            </label>

            <input
              id="email"
              type="email"
              placeholder="ton.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {serverMsg && (
            <p className="server-msg">{serverMsg}</p>
          )}

          <div className="actions">
            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
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
    </ForgotPasswordPageContainer>
  );
}

/*
RÉSUMÉ PÉDAGOGIQUE
- Page publique: pas besoin d'être connecté.
- Elle envoie l'email à /auth/forgot-password.
- Le backend répond toujours 200 même si l'email n'existe pas → pas de fuite d'info.
- On n'affiche pas d'erreur "cet email existe pas", c’est volontaire pour la sécurité.
- Après envoi, l'utilisateur voit un message rassurant.
*/
