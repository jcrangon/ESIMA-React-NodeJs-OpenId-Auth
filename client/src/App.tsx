import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import Single from "./pages/Single";
import DashboardPostNew from "./pages/DashboardPostNew";
import DashboardPostEdit from "./pages/DashboardPostEdit";
import DashboardUserEdit from "./pages/DashboardUserEdit";
import MentionsLegalesPage from "./pages/Legal/Mentions";
import PrivacyPolicyPage from "./pages/Legal/Confidentiality";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";

// Verification  du fichier d'environnement
console.log("Environnement:", import.meta.env.VITE_NODE_ENV);
console.log("Nom de l'application:", import.meta.env.VITE_APP_NAME);
console.log("URL de l'API:", import.meta.env.VITE_API_URL);


// Petit composant "vide" pour faire un préfixe d'URL (pas un layout visuel)
function PrefixOnly() {
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      {/* Routes publiques "simples" */}
      <Route path="/" element={<Home />} />
      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
      <Route path="/contact" element={<Contact />} />

      {/* Préfixe public : /auth/* */}
      <Route path="/auth" element={<PrefixOnly />}>
        <Route path="login" element={<Login />} />  {/* auth/login */}
        <Route path="register" element={<Register />} /> {/* auth/register */}
        <Route path="forgot-password" element={<ForgotPassword />} /> {/* auth/forgot-password */}
        <Route path="reset-password" element={<ResetPasswordPage />} /> {/* auth/reset-password */}
      </Route>

      {/* Préfixe public : /posts/* */}
      <Route path="/posts" element={<PrefixOnly />}>
        <Route path=":id" element={<Single />} />  {/* posts/:id */}
      </Route>

      {/* Préfixe protégé : /admin/* */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route path="dashboard" element={<PrefixOnly />}>
          <Route index element={<Dashboard />} />                 {/* /dashboard */}
          {/* Ajoute ici d'autres sous-routes protégées */}
          <Route path="posts/new" element={<DashboardPostNew />} />  {/* posts/new */}
          <Route path="posts/:id/edit" element={<DashboardPostEdit />} />  {/* posts/:id/edit */}
          <Route path="users/:id/edit" element={<DashboardUserEdit />} />  {/* users/:id/edit */}
        </Route>
      </Route>

      {/* Fallback 404 simple */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/// ============================================================================
/// 📘 Résumé pédagogique — Routing React avec routes enfants
/// ----------------------------------------------------------------------------
/// 🔹 Objectif du fichier
/// Organiser la navigation avec des **préfixes d’URL clairs**, sans afficher
/// de layout visuel global :
/**
 ✅ /auth/login
 ✅ /auth/register
 ✅ /dashboard (protégé)
*/
///
/// 🔹 Comment fonctionnent les **routes enfants**
/// - Un parent définit seulement un `element` qui contient un `<Outlet />`
/// - Les enfants héritent automatiquement du **préfixe** du parent
/**
  <Route path="/auth" element={<PrefixOnly />} >
    <Route path="login" … />  → /auth/login  ✅
*/
///
/// 🔹 Pourquoi `<PrefixOnly />` ?
/**
 ✔ Sert uniquement à fournir un `<Outlet />`
 ✔ Aucun style ni UI
 ✔ Permet de structurer l’URL sans layout global
*/
///
/// 🔹 Routes protégées (`ProtectedRoute`)
/// - Vérifie si l’utilisateur est authentifié
/// - Si ❌ pas authentifié → redirection vers `/login`
/// - Si ✅ authentifié → accès et rendu du `<Outlet />`
///
/// 🔹 Navigate : fallback 404 simple
/// Toute URL inconnue redirige vers l’accueil → éviter les écrans vides
///
/// ----------------------------------------------------------------------------
/// ✅ Résultat : un routing lisible, scalable & adapté à une vraie appli métier
/// ============================================================================