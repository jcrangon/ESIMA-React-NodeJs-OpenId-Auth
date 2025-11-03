// src/middlewares/logging.ts
import morgan from "morgan";
import type { Request } from "express";

const isProd = process.env.NODE_ENV === "production";

// Ajoute un token personnalisé lisant le traceId posé par requestId.ts
morgan.token("trace-id", (req: Request) => (req as any).traceId || req.headers["x-request-id"] || "-");

// Un format concis en dev, verbeux en prod (compatible parseurs standard)
const devFormat = ":method :url :status :res[content-length] - :response-time ms [:trace-id]";
const prodFormat = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" trace=:trace-id';

// Skip optionnel : pas de log pour /healthz, /favicon.ico, ou assets statiques
const skip = (req: Request) => {
  const url = req.originalUrl || req.url;
  return (
    url === "/healthz" ||
    url.startsWith("/favicon") ||
    url.startsWith("/uploads/") ||
    url.startsWith("/assets/")
  );
};

// Exporte deux middlewares prêts à l’emploi
export const accessLogger = morgan(isProd ? prodFormat : devFormat, { skip });

// Si tu veux un logger “erreurs server 5xx” dans un flux séparé (optionnel)
export const errorOnlyLogger = morgan(isProd ? prodFormat : devFormat, {
  skip: (_req, res) => res.statusCode < 500,
});
