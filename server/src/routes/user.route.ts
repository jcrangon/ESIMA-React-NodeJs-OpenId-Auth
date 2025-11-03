import { Router } from "express";
import {
  status,
  getMe,
  updateMe,
  changeMyPassword,
  listUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/requireAdmin.middleware";

const r = Router();

// Liaison du segment d'url avec la méthode de contrôleur à executer
r.get("/health", status);

// Profil personnel
r.get("/me", requireAuth, getMe);
r.patch("/me", requireAuth, updateMe);
r.patch("/me/password", requireAuth, changeMyPassword);

/* ============================================================================
   ⚙️ ROUTES ADMINISTRATEUR UNIQUEMENT
   ----------------------------------------------------------------------------
   Nécessitent req.auth.role === "ROLE_ADMIN".
   Ces endpoints permettent la gestion globale des utilisateurs.
   ============================================================================
*/

// Liste paginée des utilisateurs
r.get("/", requireAuth, requireAdmin,listUsers);
// Lire un utilisateur spécifique
r.get("/:id", requireAuth, getUserById);
// Modifier le rôle d’un utilisateur (promouvoir ou rétrograder)
r.patch("/:id/role", requireAuth, requireAdmin, updateUserRole);
// Supprimer un utilisateur
r.delete("/:id", requireAuth, requireAdmin, deleteUser);

export default r;