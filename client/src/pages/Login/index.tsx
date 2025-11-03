// src/pages/LoginPage/index.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { LoginPageContainer } from "./style";
import { extractAppErrorPayload } from "@/axios/axios";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginPage() {
  // état du formulaire
  const [form, setForm] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  // erreurs par champ (email, password, etc.)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // message d'erreur global remonté par le backend
  const [serverError, setServerError] = useState<string>("");

  // message de succès
  const [successMsg, setSuccessMsg] = useState<string>("");

  // état d'envoi (pour désactiver le bouton / inputs)
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Validation locale minimale
  function validateClientSide(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.email.trim()) {
      newErrors.email = "Email obligatoire";
    }

    if (!form.password) {
      newErrors.password = "Mot de passe obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // reset affichage précédent
    setErrors({});
    setServerError("");
    setSuccessMsg("");

    // check front
    if (!validateClientSide()) return;

    try {
      setLoading(true);

      // on délègue l'appel API au AuthProvider via login()
      // login() s'occupe de :
      //  - POST /auth/login { email, password, rememberMe }
      //  - récupérer { user, refreshToken }
      //  - stocker refreshToken dans localStorage
      //  - setUser(user) dans le contexte global
      await login(form.email, form.password, form.rememberMe);

      // si login() ne throw pas, on considère que c'est bon
      setSuccessMsg("Connexion réussie ✔ Redirection en cours...");

      // petit délai pour laisser l'utilisateur voir le message
      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (err) {
      // si login() a throw, c'est probablement une 401 ou une erreur de validation
      const { message, fieldErrors, traceId } = extractAppErrorPayload(err);

      // message global / bannière
      setServerError(traceId ? `${message} — ref ${traceId}` : message);

      // erreurs par champ (ex: email inconnu, mauvais mdp)
      setErrors((prev) => ({
        ...prev,
        ...fieldErrors,
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginPageContainer>
      <div className="card">
        <div className="card-header">
          <h1 className="title">Connexion</h1>
          <p className="subtitle">
            Rentre et retrouve ton espace personnel.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
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

          {/* Mot de passe */}
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

          {/* Remember me */}
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

          {/* Lien mot de passe oublié */}
          <div className="forgot-row">
            <span className="hint">Mot de passe oublié ?</span>{" "}
            <a className="forgot-link" href="/auth/forgot-password">
              Réinitialiser mon mot de passe
            </a>
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
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>
      </div>
    </LoginPageContainer>
  );
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — src/pages/LoginPage/index.tsx
===============================================================================

OBJECTIF DE LA PAGE
-------------------
Cette page permet à l'utilisateur existant de se connecter.
Elle ne gère pas l'état global d'auth elle-même : elle délègue au AuthProvider
via le hook `useAuth()`, qui expose la méthode `login()`.

Donc le composant fait :
1. collecte des credentials (email / password / rememberMe),
2. validation rapide côté client,
3. appel `login()` (qui appelle l'API backend),
4. gestion des retours (succès ou erreur),
5. redirection après succès.

Elle reste ultra-fine : elle ne manipule pas les tokens directement.


COMMENT LE FORMULAIRE EST GÉRÉ
------------------------------
- `form`: état contrôlé pour email / password / rememberMe.
- `errors`: objet `{ champ: "message d'erreur" }`. Sert à afficher une erreur
  *sous le label* du champ concerné.
- `serverError`: message d'erreur global renvoyé par le backend (ex: "Invalid credentials").
- `successMsg`: message "Connexion réussie ✔ ...".
- `loading`: pour désactiver les inputs et éviter le double submit.

`useNavigate()` (React Router) sert à envoyer l'utilisateur ailleurs (`navigate("/")`)
après le succès. Tu peux changer la route très facilement (`/dashboard`, `/app`, etc.).


VALIDATION CÔTÉ FRONT
---------------------
`validateClientSide()` impose juste :
- email non vide
- mot de passe non vide

Pourquoi si minimal ?
- On ne cherche pas ici à faire une validation "forte" : le vrai contrôle
  d'identifiants sera côté backend.
- Le but est juste d'éviter d'appeler le serveur avec des champs vides.


APPEL AU BACKEND = `login()`
----------------------------
Dans `handleSubmit()` on ne fait PAS d'`api.post` nous-mêmes.
On appelle :

```ts
await login(form.email, form.password, form.rememberMe);
```

C'est le AuthProvider (via le hook `useAuth()`) qui s'occupe de :
- faire l'appel API POST /auth/login,
- gérer le stockage du refreshToken,
- mettre à jour l'état global d'authentification.

Si `login()` réussit, on affiche un message de succès et on redirige.
S'il échoue (throw), on extrait les messages d'erreur et on les affiche.*/