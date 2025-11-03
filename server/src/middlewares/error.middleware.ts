// src/middlewares/error.middleware.ts
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

const isProd = process.env.NODE_ENV === "production";

// Types facultatifs pour reconnaitre sans importer lourdement
type ZodIssue = { path: (string | number)[]; message: string; code?: string };
type ZodErrorLike = { name: string; issues: ZodIssue[] };
type PrismaKnownErrorLike = { code?: string; meta?: Record<string, unknown>; clientVersion?: string };
type MulterErrorLike = { name: string; code?: string; field?: string };

// Petit logger unifié
function logError(err: unknown, req: Request, traceId: string) {
  const base = `[error] ${req.method} ${req.originalUrl} [${traceId}]`;
  if (err instanceof Error) {
    if (isProd) {
      const status = (err as any).status ?? 500;
      console.error(`${base} → ${err.name}: ${err.message} (status=${status})`);
    } else {
      console.error(base, err);
    }
  } else {
    console.error(base, err);
  }
}

// Normalisation de la réponse envoyée au client
function sendJson(
  res: Response,
  opts: { status: number; code: string; message: string; details?: unknown; traceId: string; stack?: string }
) {
  const payload: Record<string, unknown> = {
    error: {
      status: opts.status,       // 👈 ajouté pour standardiser
      code: opts.code,
      message: opts.message,
      details: opts.details,
      traceId: opts.traceId,     // 👈 dans error (plus pratique côté front)
    },
  };

  // En dev on renvoie la stack (pratique pour débug)
  if (!isProd && opts.stack) {
    (payload.error as any).stack = opts.stack;
  }

  res.status(opts.status).json(payload);
}

// Middleware 404 optionnel (à monter avant errorHandler)
export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound("Route not found"));
}

// Middleware global d’erreurs
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const traceId =
    (req.headers["x-request-id"] as string) ||
    // eslint-disable-next-line no-restricted-globals
    (typeof crypto !== "undefined" && "randomUUID" in crypto ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2));

  // Mapping Zod → 422 (UNPROCESSABLE) au lieu de 400
  if (typeof err === "object" && err && (err as any).name === "ZodError") {
    const z = err as ZodErrorLike;
    const details = z.issues?.map((i) => ({
      path: i.path.join("."),
      message: i.message,
      code: i.code,
    }));
    logError(err, req, traceId);
    return sendJson(res, {
      status: 422, // 👈 changé
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details,
      traceId,
      stack: (err as any).stack,
    });
  }

  // Mapping Prisma Known Errors
  // P2002: Unique constraint failed
  // P2025: Record not found
  const maybePrisma = err as PrismaKnownErrorLike & Error;
  if (maybePrisma?.code?.startsWith?.("P")) {
    const codeMap: Record<string, { status: number; code: string; message: string }> = {
      P2002: { status: 409, code: "UNIQUE_CONSTRAINT", message: "Unique constraint violation" },
      P2025: { status: 404, code: "RECORD_NOT_FOUND", message: "Record not found" },
      // (optionnel) ajoute ici d'autres codes connus si besoin (P2003 etc.)
    };
    const mapped = codeMap[maybePrisma.code] ?? { status: 500, code: "PRISMA_ERROR", message: "Database error" };
    logError(err, req, traceId);
    return sendJson(res, {
      status: mapped.status,
      code: mapped.code,
      message: mapped.message,
      details: maybePrisma.meta,
      traceId,
      stack: isProd ? undefined : maybePrisma.stack,
    });
  }

  // JWT errors (jsonwebtoken)
  if (typeof err === "object" && err && ("name" in err)) {
    const name = (err as any).name as string;
    if (name === "TokenExpiredError") {
      logError(err, req, traceId);
      return sendJson(res, {
        status: 401,
        code: "TOKEN_EXPIRED",
        message: "Access token expired",
        details: { expiredAt: (err as any).expiredAt },
        traceId,
        stack: (err as any).stack,
      });
    }
    if (name === "JsonWebTokenError") {
      logError(err, req, traceId);
      return sendJson(res, {
        status: 401,
        code: "TOKEN_INVALID",
        message: (err as any).message || "Invalid token",
        traceId,
        stack: (err as any).stack,
      });
    }
  }

  // Multer errors (upload)
  if (typeof err === "object" && err && (err as MulterErrorLike).name === "MulterError") {
    const m = err as MulterErrorLike & Error;
    logError(err, req, traceId);
    return sendJson(res, {
      status: 400,
      code: "UPLOAD_ERROR",
      message: "File upload error",
      details: { multerCode: m.code, field: m.field },
      traceId,
      stack: m.stack,
    });
  }

  // Body parser JSON invalide → SyntaxError avec status 400
  if (err instanceof SyntaxError && "body" in (err as any)) {
    logError(err, req, traceId);
    return sendJson(res, {
      status: 400,
      code: "INVALID_JSON",
      message: "Malformed JSON in request body",
      traceId,
      stack: err.stack,
    });
  }

  // AppError custom (contrôlée)
  if (err instanceof AppError) {
    logError(err, req, traceId);
    return sendJson(res, {
      status: err.status,
      code: err.code,
      message: err.expose ? err.message : "Internal Server Error",
      details: err.details,
      traceId,
      stack: isProd ? undefined : (err as any).stack,
    });
  }

  // Fallback inconnu
  const unknown = err as Error;
  logError(unknown, req, traceId);
  return sendJson(res, {
    status: 500,
    code: "INTERNAL_ERROR",
    message: isProd ? "Internal Server Error" : (unknown?.message || "Internal Server Error"),
    traceId,
    stack: isProd ? undefined : unknown?.stack,
  });
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE TRÈS DÉTAILLÉ — Middleware d’erreurs Express “pro”
============================================================================= 

🎯 Objectif
- Centraliser la gestion d’erreurs pour **toutes** les couches (validation Zod, base Prisma,
  auth JWT, upload Multer, JSON invalide, erreurs métier AppError, inconnues).
- Produire des réponses **uniformes** et **faciles à consommer** côté front (shape commun).
- Protéger les détails sensibles en prod, tout en rendant le debug confortable en dev.

──────────────────────────────────────────────────────────────────────────────
1) Orchestration & ordre de montage
- `notFound` doit être monté **avant** `errorHandler` pour transformer les 404 en `AppError`.
- `errorHandler` doit être le **dernier** middleware (après routes & autres middlewares).
- En pratique dans `app.ts` :
    app.use("/routes", routes);
    app.use(notFound);       // 404 → AppError.notFound()
    app.use(errorHandler);   // capte toutes les erreurs

──────────────────────────────────────────────────────────────────────────────
2) Traçabilité — `traceId` pour corréler logs et réponses
- Génère un `traceId` (UUID si dispo, sinon fallback pseudo-aléatoire).
- S’il existe un header `x-request-id`, on le réutilise (utile derrière un reverse-proxy / gateway).
- Le `traceId` est injecté dans :
    a) les logs (serveur)
    b) la réponse JSON (`error.traceId`)
→ Le front peut l’afficher et le reporter lors d’un ticket.

──────────────────────────────────────────────────────────────────────────────
3) Shape de réponse standardisée
- Toujours `HTTP status` cohérent + JSON :
  {
    "error": {
      "status": <number>,
      "code":   <STRING_CONSTANTE>,
      "message":"<lisible pour humain>",
      "details":{ ...optionnel... },
      "traceId":"<id>"
      // + "stack" en dev uniquement
    }
  }
- Avantages : traitement unifié côté front (toast, banner, i18n, tracking).

──────────────────────────────────────────────────────────────────────────────
4) Politique de verbosité (prod vs dev)
- `isProd` masque la stack par défaut (éviter d’exposer des chemins, secrets, traces SQL).
- En dev, la stack est renvoyée pour aller plus vite au diagnostic.
- Les logs serveur restent complets en dev (objet d’erreur entier).

──────────────────────────────────────────────────────────────────────────────
5) Mappings d’erreurs clés
a) **Zod** → `422 Unprocessable Entity`
   - Pourquoi 422 (et pas 400) ? 422 signifie “syntactiquement valide, mais invalide
     sémantiquement selon les règles métier/validation”. Très parlant côté API.
   - `details` expose la liste des issues : `path`, `message`, `code`.

b) **Prisma** erreurs connues
   - `P2002` → `409 Conflict` (violation d’unicité)
   - `P2025` → `404 Not Found` (record introuvable)
   - Sinon → `500 PRISMA_ERROR`
   - `details` peut inclure `meta` (ex: fields en cause). En prod, on garde la prudence.

c) **JWT (jsonwebtoken)**
   - `TokenExpiredError` → `401 TOKEN_EXPIRED` (+ `expiredAt` dans `details`)
   - `JsonWebTokenError` → `401 TOKEN_INVALID`
   - Permet au front de déclencher un **refresh token** ou une **redirection login**.

d) **Multer (upload)**
   - `400 UPLOAD_ERROR` + `details` (`multerCode`, `field`) pour un feedback UX précis
     (ex: “format interdit”, “taille dépassée”, “champ manquant”).

e) **JSON invalide** (body-parser)
   - `SyntaxError` avec `err.body` → `400 INVALID_JSON`
   - Important : différencier *malformed JSON* de *validation échouée* (Zod 422).

f) **AppError** (erreur métier maîtrisée)
   - Transport d’un `status`, `code`, `message`, `details`, et flag `expose`.
   - Si `expose=false`, on remplace par message générique en prod.

g) **Fallback inconnu**
   - `500 INTERNAL_ERROR` + message générique en prod.

──────────────────────────────────────────────────────────────────────────────
6) Conception d’`AppError` (rappel)
- Classe utilitaire pour lever des erreurs métiers de façon propre :
  new AppError(status, code, message, { details }, expose = true)
- Helpers statiques utiles :
  - `AppError.notFound(msg)`
  - `AppError.badRequest(msg)`
  - `AppError.forbidden(msg)`
  - `AppError.unauthorized(msg)`
  - `AppError.conflict(msg)` …
→ Rend le code des controllers/services bien plus lisible.

──────────────────────────────────────────────────────────────────────────────
7) Sécurité & bonnes pratiques
- Ne **jamais** renvoyer de détails sensibles en prod (stack, requêtes SQL, secrets).
- Journaliser côté serveur avec parcimonie mais suffisamment (inclure `traceId`, status).
- Normaliser les codes (`code: "TOKEN_EXPIRED"`, etc.) pour éviter les *stringly-typed mistakes*.
- Penser au **rate limiting** (ex: sur `/auth`) et à la **détection d’abus**.

──────────────────────────────────────────────────────────────────────────────
8) Intégration côté front (exemple)
- Intercepteur Axios :
    if (err.response?.data?.error) {
      const { status, code, message, details, traceId } = err.response.data.error;
      // afficher toast/UI
      // si code === "TOKEN_EXPIRED" → déclencher refresh()
    }
- UX : afficher un message clair + référence `traceId` pour support.

──────────────────────────────────────────────────────────────────────────────
9) Tests à prévoir (idées)
- Zod : payload invalide → 422 + `details[]`.
- Prisma :
  - create user dupliqué → 409 P2002
  - get by id inexistant → 404 P2025
- JWT :
  - token expiré → 401 TOKEN_EXPIRED
  - token altéré → 401 TOKEN_INVALID
- Upload :
  - mauvais mimetype → 400 UPLOAD_ERROR
- JSON invalide → 400 INVALID_JSON
- AppError.notFound route inconnue → 404 NOT_FOUND
- Fallback : `throw new Error("boom")` → 500 INTERNAL_ERROR (stack en dev).

──────────────────────────────────────────────────────────────────────────────
10) Astuces de maintenance
- Centraliser le **dictionnaire de codes** d’erreur (pour i18n/analytics).
- Documenter les réponses d’erreur dans l’OpenAPI/Swagger (schéma commun `ErrorResponse`).
- Envisager un hook `onErrorReported(err, traceId)` pour pipe vers Sentry/Datadog en prod.

──────────────────────────────────────────────────────────────────────────────
✅ À retenir
- **Un seul** point d’entrée pour toutes les erreurs = code plus propre, front plus simple.
- **Codes HTTP + codes applicatifs** cohérents = DX & UX excellentes.
- **Prod vs Dev** : sécurité d’abord, confort ensuite.
- **Traçabilité** par `traceId` : essentielle pour déboguer vite en équipe.

============================================================================= */