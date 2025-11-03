import { useState } from "react";
import type { FormEvent } from "react";
import { RegisterPageContainer } from "./style";
import { api, extractAppErrorPayload } from "@/axios/axios";
import { useNavigate } from "react-router-dom";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
};

export default function RegisterPage() {
  // Etat du formulaire
  const [form, setForm] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  // Erreurs par champ (côté front ou renvoyées par l'API)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Message global renvoyé par l'API (ex: "Unique constraint violation")
  const [serverError, setServerError] = useState<string>("");

  // Message succès
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Chargement état bouton
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Validation basique côté client avant l'appel réseau
  function validateClientSide(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Nom obligatoire";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email obligatoire";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = "Format email invalide";
    }

    if (!form.password) {
      newErrors.password = "Mot de passe obligatoire";
    } else if (form.password.length < 6) {
      newErrors.password = "6 caractères minimum";
    }

    if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // reset état visuel précédent
    setErrors({});
    setServerError("");
    setSuccessMsg("");

    // validation locale
    if (!validateClientSide()) return;

    try {
      setLoading(true);

      // 1) créer le compte
      const res = await api.post(
        "/auth/register",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        },
        {
          // très important :
          // pas d'essai auto de refresh si on reçoit 409 (email déjà utilisé)
          skipAuthRefresh: true,
        }
      );

      // 2) si OK -> connexion auto
      if (res.status >= 200 && res.status < 300) {
        setSuccessMsg("Compte créé ✔ Veuillez patienter.");
        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          rememberMe: false,
        });
        
        setTimeout(() => {
          // Redirection ou autre action après le succès
          
          navigate("/auth/login");
        }, 800);
      }
    } catch (err) {
      // ici on lit l'erreur au format standard du backend
      const { message, fieldErrors, traceId } = extractAppErrorPayload(err);

      // message global
      // si tu veux : inclure le traceId pour debug support
      // ex: `${message} (ref ${traceId})`
      setServerError(traceId ? `${message} — ref ${traceId}` : message);

      // fusionne erreurs par champ du backend avec d'éventuelles erreurs locales
      setErrors((prev) => ({
        ...prev,
        ...fieldErrors,
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <RegisterPageContainer>
      <div className="card">
        <div className="card-header">
          <h1 className="title">Créer un compte</h1>
          <p className="subtitle">Rejoins la plateforme en 30 secondes.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Nom */}
          <div className="field">
            <label htmlFor="name">
              <span>Nom complet</span>
              {errors.name && <span className="error">{errors.name}</span>}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jean Dupont"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="field">
            <label htmlFor="email">
              <span>Email</span>
              {errors.email && <span className="error">{errors.email}</span>}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ton.email@exemple.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Password + Confirmation */}
          <div className="row-2col">
            <div className="field">
              <label htmlFor="password">
                <span>Mot de passe</span>
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">
                <span>Confirmer</span>
                {errors.confirmPassword && (
                  <span className="error">{errors.confirmPassword}</span>
                )}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* RememberMe */}
          <div className="remember-row">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={form.rememberMe}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="rememberMe">
              Rester connecté(e) plus longtemps
            </label>
          </div>

          {/* feedback global backend */}
          <div className="feedback">
            {serverError && (
              <p className="server-error">{serverError}</p>
            )}
            {successMsg && (
              <p className="server-success">{successMsg}</p>
            )}
          </div>

          {/* submit */}
          <div className="submit-block">
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </div>
        </form>
      </div>
    </RegisterPageContainer>
  );
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — src/pages/RegisterPage/index.tsx
===============================================================================

ROLE DE CETTE PAGE
------------------
- Cette page affiche un formulaire d'inscription utilisateur.
- Elle valide les champs côté frontend (ex: email valide, mots de passe identiques).
- Elle appelle le backend pour créer le compte (POST /auth/register).
- Si l'inscription réussit, on renvoie l'utilisateur à une page de login.

FLUX GLOBAL
-----------
1. L'utilisateur remplit name / email / password / confirmPassword.
2. handleSubmit() fait d'abord une validation côté client (regex email, etc.).
3. Si OK:
   a) POST /auth/register avec { name, email, password }.
   b) Si statut HTTP 2xx -> on affiche un message de succès.
   c) Optionnel: on peut faire un login automatique après inscription.
4. Si erreur réseau ou API:
   a) on extrait le message d'erreur standard via extractAppErrorPayload().
   b) on affiche le message global dans serverError.
   c) on affiche les erreurs par champ (fieldErrors) à côté des inputs.

4. Si l'API répond une erreur (ex: email déjà utilisé),
   on affiche err.response.data.error dans serverError.

SECURITE / SESSIONS
-------------------
- Après login(), on est officiellement authentifié dans le contexte global d'auth.
- Ce contexte est accessible partout via useAuthContext() pour savoir si l'utilisateur
  est connecté, quel est son rôle, etc.
- Le refreshToken reste dans localStorage pour permettre la reconnexion silencieuse
  plus tard via /auth/refresh (géré dans AuthProvider + interceptors axios).

STYLE / THEME
-------------
- Le conteneur principal de la page est stylé via styled-components
  dans style.ts (RegisterPageContainer).
- À l'intérieur, on utilise des classes CSS "card", "field", etc.
  avec une esthétique sombre bleutée cohérente avec ton thème global :
  - fond radial bleu nuit
  - cartes en bleu/gris translucide
  - surlignage lumineux sur le bouton submit

REMEMBERME
----------
- La checkbox rememberMe est envoyée au login automatique après création.
- Elle permet de dire "génère-moi un refreshToken plus long côté backend",
  donc une session persistante plus longue.

POUR ALLER PLUS LOIN
--------------------
- On pourrait brancher Zod pour une validation plus stricte typée.
- On pourrait router l'utilisateur vers /dashboard après succès
  au lieu de juste afficher le message de succès.
- On pourrait désactiver le login auto si tu veux valider l'email d'abord,
  dans ce cas il suffit d'enlever l'appel à login() après register.

============================================================================= */
