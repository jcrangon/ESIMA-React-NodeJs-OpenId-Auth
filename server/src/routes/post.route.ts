import { Router } from "express";
import {
  status,
  listAllPosts,
  listMyPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/post.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import  {  upload  }  from  "../middlewares/multer.middleware";  ;

const r = Router();

/**
 * Routes publiques
 */
r.get("/health", status);
r.get("/", asyncHandler(listAllPosts));       // GET /posts
r.get("/:id", asyncHandler(getPostById));     // GET /posts/123

/**
 * Routes protégées
 */
r.get("/member/list", requireAuth, asyncHandler(listMyPosts)); // GET /posts/member
r.post("/member/create", requireAuth, upload.single("cover"), asyncHandler(createPost));        // POST /posts/member/create
r.patch("/member/update/:id", requireAuth, upload.single("cover"),asyncHandler(updatePost));    // PATCH /posts/member/update/:id
r.delete("/member/delete/:id", requireAuth, asyncHandler(deletePost));   // DELETE /posts/member/delete/:id

export default r;

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — post.route.ts
===============================================================================

Pourquoi requireAuth uniquement sur certaines routes ?
- Lire tous les posts = public (/posts, /posts/:id)
- Lire mes posts = privé (/posts/me/mine)
- Créer / modifier / supprimer = privé (on doit connaître l'auteur)

Pourquoi asyncHandler ?
- Tes contrôleurs sont async/await et peuvent throw AppError.
- asyncHandler attrape les erreurs et les envoie vers ton errorHandler global
  au lieu de laisser Express se perdre.

Exemple de flux :
1. Le front envoie POST /posts avec { title, content } :
   - requireAuth vérifie le cookie access_token → req.auth.userId = 42
   - createPost crée en base un post avec authorId=42

2. Le front envoie PATCH /posts/10 :
   - requireAuth pose req.auth.userId
   - updatePost vérifie que le post 10 appartient bien à userId ou que role === "ROLE_ADMIN"
   - sinon 403
============================================================================= */
