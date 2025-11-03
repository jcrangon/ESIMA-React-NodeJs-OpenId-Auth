// src/db/mongo.ts
import mongoose, { Schema, type ConnectOptions } from "mongoose";
import { env } from "../config/env";

/** Détection d'environnement */
const isProd = process.env.NODE_ENV === "production";

/** Options de connexion (ajuste au besoin) */
const options: ConnectOptions = {
  // En prod, laisse mongoose gérer l'autoIndex selon ton choix d'indexation
  autoIndex: !isProd,
  // poolSize, socketTimeoutMS, etc. peuvent être ajoutés ici
};

/** Singleton pour hot-reload (Vite/tsx/nodemon/Next) */
declare global {
  // eslint-disable-next-line no-var
  var __mongoConn__: Promise<typeof mongoose> | undefined;
}

/** Debug + métriques simples des requêtes (dev uniquement) */
function setupDebug() {
  if (isProd) return;

  // Debug bas niveau: collection, méthode et paramètres
  // (en évitant d'afficher les buffers/document volumineux)
  mongoose.set("debug", function (collectionName: string, methodName: string, ...methodArgs: any[]) {
    const argsPreview = JSON.stringify(methodArgs, (_k, v) => (v?._id ? String(v._id) : v));
    console.log(`[mongo:debug] ${collectionName}.${methodName} args=${argsPreview}`);
  });
}

/** Plugin global: mesure de durée des opérations Mongoose */
function setupTimingPlugin() {
  const timingPlugin = (schema: Schema) => {
    // Une seule RegExp pour couvrir tous les hooks visés
    const ops = /^(count|countDocuments|find|findOne|updateOne|updateMany|aggregate|save)$/;

    schema.pre(ops, function preHook(this: any, next) {
      this.___start = Date.now();
      next();
    });

    // Signature générique (doc|result, next) — compatible avec save/find/etc.
    schema.post(ops, function postHook(this: any, _res: any, next: () => void) {
      const start = this.___start as number | undefined;
      if (!isProd && typeof start === "number") {
        const ms = Date.now() - start;
        const modelName = this?.model?.modelName ?? this?.constructor?.modelName ?? "UnknownModel";
        const op = this?.op ?? this?.constructor?.name ?? "op";
        console.log(`[mongo] ${modelName}.${String(op)} (${ms} ms)`);
      }
      next();
    });
  };

  mongoose.plugin(timingPlugin);
}


/** Connexion unique à Mongo */
export async function connectMongo(): Promise<void> {
  // déjà connecté
  if (mongoose.connection.readyState === 1) return;

  // déjà en cours de connexion
  if (globalThis.__mongoConn__) {
    await globalThis.__mongoConn__;
    return;
  }

  setupDebug();
  setupTimingPlugin();

  globalThis.__mongoConn__ = mongoose.connect(env.MONGO_URL, options);

  try {
    await globalThis.__mongoConn__;
    console.log("[mongo] connected");
  } catch (err) {
    // en cas d’échec, nettoie le cache pour permettre une nouvelle tentative
    globalThis.__mongoConn__ = undefined;
    console.error("[mongo] connection error:", err);
    throw err;
  }

  // Événements utiles
  mongoose.connection.on("disconnected", () => console.warn("[mongo] disconnected"));
  mongoose.connection.on("reconnected", () => console.log("[mongo] reconnected"));
  mongoose.connection.on("error", (e) => console.error("[mongo] error:", e));
}

/** Déconnexion explicite (utile dans certains tests/scripts) */
export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    globalThis.__mongoConn__ = undefined;
    console.log("[mongo] disconnected (manual)");
  }
}

/** Indicateur simple d’état de connexion (healthcheck app) */
export function mongoIsConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/* --------------------------------- Schémas --------------------------------- */

const AuditSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now, index: true },
    userId: { type: Number, index: true },
    action: { type: String, required: true, index: true },
    meta: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true, // createdAt / updatedAt automatiques
    versionKey: false,
  }
);

// Index composés utiles pour les requêtes fréquentes (ex: logs récents d’un user)
AuditSchema.index({ userId: 1, at: -1 });
AuditSchema.index({ action: 1, at: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditSchema);

/* ------------------------------ Arrêt propre ------------------------------- */

async function gracefulExit(signal: string) {
  try {
    console.log(`[mongo] Received ${signal}. Closing connection...`);
    await disconnectMongo();
  } catch (err) {
    console.error("[mongo] error during disconnect:", err);
  } finally {
    // on laisse le process s’arrêter naturellement
  }
}

process.on("SIGINT", () => void gracefulExit("SIGINT"));
process.on("SIGTERM", () => void gracefulExit("SIGTERM"));

/**
 * ────────────────────────────────────────────────────────────────
 * 🎓 Résumé pédagogique détaillé (Mongo/Mongoose)
 * ────────────────────────────────────────────────────────────────
 * ✅ Singleton & hot-reload :
 *    - On met en cache la promesse de connexion dans `globalThis.__mongoConn__`
 *      pour éviter d’ouvrir N connexions en dev à chaque reload.
 *
 * ✅ Logs & métriques :
 *    - `mongoose.set('debug', ...)` journalise les opérations (dev).
 *    - Un plugin global mesure le temps (ms) des requêtes (pre/post hooks).
 *
 * ✅ Options dev/prod :
 *    - `autoIndex` activé en dev pour créer les index automatiquement.
 *      En prod, préfère des migrations/commands dédiées d’indexation.
 *
 * ✅ Schéma Audit :
 *    - `timestamps` + index (simples et composés) pour des requêtes rapides
 *      du type « logs récents par user » / « par type d’action ».
 *
 * ✅ Arrêt propre :
 *    - Gestion des signaux `SIGINT`/`SIGTERM` → `disconnect()` propre.
 *
 * En résumé :
 * → Une seule connexion, observable, et proprement fermée.
 * → Traçabilité des requêtes pour diagnostiquer les lenteurs.
 * → Schéma de logs prêt pour la prod (index pertinents).
 * ────────────────────────────────────────────────────────────────
 */
