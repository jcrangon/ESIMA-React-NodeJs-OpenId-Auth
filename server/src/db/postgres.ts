// src/db/postgres.ts
import { PrismaClient } from "@prisma/client";

/** Détection d'env + logs */
const isProd = process.env.NODE_ENV === "production";

/** Évite Prisma.LogLevel (pas toujours exporté selon versions) */
type PrismaLogLevel = "query" | "info" | "warn" | "error";
const prismaLog = (isProd ? ["warn", "error"] : ["info", "warn", "error"]) as PrismaLogLevel[];

/** Options sans dépendre de Prisma.* */
const prismaOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  log: prismaLog,
  errorFormat: isProd ? "minimal" : "pretty",
};

/** Singleton hot-reload safe */
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

function createBaseClient() {
  return new PrismaClient(prismaOptions);
}

const base = globalThis.__prisma__ ?? createBaseClient();
if (!isProd) globalThis.__prisma__ = base;

/**
 * Tracing via Query Extensions ($extends)
 * → fonctionne en Node, Edge, Accelerate/Data Proxy
 */
export const prisma = base.$extends({
  query: {
    $allModels: {
      // typage explicite "any" pour rester compatible toutes versions (évite implicit any)
      $allOperations: async ({
        model,
        operation,
        args,
        query,
      }: {
        model?: string;
        operation: string;
        args: unknown;
        query: (args: unknown) => Promise<unknown>;
      }) => {
        const start = Date.now();
        try {
          const result = await query(args);
          const ms = Date.now() - start;

          if (!isProd) {
            let size = "";
            if (Array.isArray(result)) size = ` items=${result.length}`;
            else if (result && typeof result === "object") size = " item=1";
            console.log(
              `[prisma] ${model ?? "$internal"}.${operation} (${ms} ms)${size}`
            );
          }
          return result;
        } catch (e) {
          const ms = Date.now() - start;
          console.error(
            `[prisma] ${model ?? "$internal"}.${operation} FAILED after ${ms} ms`
          );
          throw e;
        }
      },
    },
  },
});

/** Arrêt propre (SIGINT/SIGTERM) — safe en Node/Edge */
async function gracefulExit(signal: string) {
  try {
    console.log(`[prisma] Received ${signal}. Closing DB connections...`);
    await prisma.$disconnect();
  } catch (err) {
    console.error("[prisma] Error during disconnect:", err);
  }
}
if (typeof process !== "undefined" && process?.on) {
  process.on("SIGINT", () => void gracefulExit("SIGINT"));
  process.on("SIGTERM", () => void gracefulExit("SIGTERM"));
}

/**
 * ────────────────────────────────────────────────────────────────
 * 🎓 Résumé pédagogique
 * ────────────────────────────────────────────────────────────────
 * • Pourquoi $extends et pas $use ?
 *   → Dans Edge/Accelerate/Data Proxy, $use n’existe pas ; $extends (query extensions)
 *     est supporté partout. On intercepte toutes les requêtes via $allModels/$allOperations.
 *
 * • Compatibilité TypeScript stricte
 *   → On évite les types internes Prisma (ex. Prisma.LogLevel) qui varient selon versions.
 *     Les paramètres du hook sont typés explicitement pour éviter l’implicit any.
 *
 * • Logs intelligents
 *   → Affiche modèle + opération + durée + taille de résultat (items=…)
 *     en dev uniquement ; prod reste plus silencieuse.
 *
 * • Singleton hot-reload
 *   → Réutilise l’instance via globalThis pour ne pas saturer Postgres en dev.
 *
 * • Arrêt propre
 *   → Gestion de SIGINT/SIGTERM ; $disconnect ferme proprement les connexions.
 * ────────────────────────────────────────────────────────────────
 */
