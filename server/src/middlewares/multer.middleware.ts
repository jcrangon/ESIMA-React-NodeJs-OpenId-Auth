import multer from "multer";
import path from "node:path";
import { env } from "../config/env";

// Extensions et mimetypes autorisés
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Conversion Mo → octets à partir de la variable env
const MAX_SIZE_BYTES =
  Number(env.MAX_UPLOAD_SIZE_MB) * 1024 * 1024 || 5 * 1024 * 1024; // fallback 5 Mo

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

function fileFilter(
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_BYTES
  }
});

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — Gestion dynamique de la taille d’upload
=============================================================================

🎯 Objectif
- Rendre la limite d’upload **paramétrable** selon l’environnement (dev / prod)
- Éviter toute valeur codée en dur → pratique DevOps & CI/CD

──────────────────────────────────────────────────────────────────────────────
1) Utilisation de la variable d’env
`.env` :
MAX_UPLOAD_SIZE_MB=10

✅ Permet d’augmenter la limite uniquement en modifiant la configuration  
✅ Pas besoin de recompiler / modifier le code  

──────────────────────────────────────────────────────────────────────────────
2) Conversion Mo → octets
Multer attend une taille en **octets**, donc :
X Mo → X * 1024 * 1024

📌 Exemple dans un environnement prod
MAX_UPLOAD_SIZE_MB=20 → 20 * 1024 * 1024 = **20 971 520 octets**

──────────────────────────────────────────────────────────────────────────────
3) Sécurité renforcée
- `fileFilter` bloque tout fichier non image → prévention exploitation via scripts
- `limits.fileSize` protège contre :  
  - attaques de surcharge (DoS avec fichiers énormes)
  - erreurs UX côté front

✅ Et tout est récupéré par ton `errorHandler` (MulterError → `UPLOAD_ERROR`)

──────────────────────────────────────────────────────────────────────────────
4) Bonnes pratiques DevOps mises en place
- **configuration externalisée**
- gestion **selon environnement**
  - Ex: 2Mo en prod web
  - 50Mo en interne / testing
- fallback automatique si variable non définie ✅

──────────────────────────────────────────────────────────────────────────────
📌 À retenir
✔️ Taille configurable **sans toucher au code**  
✔️ Meilleure sécurité et performance  
✔️ Prêt pour la production (scalabilité & CI/CD)

──────────────────────────────────────────────────────────────────────────────
Exemples d'utilisation :

upload d’un seul fichier : upload.single("avatar")
upload de plusieurs fichiers : upload.array("photos", 10)
upload multi-champs : upload.fields([...])

============================================================================= */