import app from "./app";
import { env } from "./config/env";

console.log("[exec] Point d'entrée du serveur atteint....");

app.listen(env.PORT, () => {
  console.log("API listening on port", env.PORT);
  console.log("📘 Swagger UI available at: http://localhost:8080/docs");
});

/// ============================================================================
/// 📘 Résumé pédagogique complet — Comprendre le rôle du fichier d’entrée du serveur
/// ----------------------------------------------------------------------------
/// 🔹 1. Objectif du fichier
///
/// Ce fichier (souvent appelé `index.ts` ou `server.ts`) constitue **le point d’entrée**
/// de ton application backend.  
/// Il a une seule responsabilité :
/**
 * ➤ Démarrer le serveur Express et l’écouter sur un port défini.
 */
///
/// En d’autres termes, `app.ts` configure **le comportement** du serveur (middlewares, routes...),
/// tandis que ce fichier en assure **le lancement**.
///
/// ----------------------------------------------------------------------------
/// 🔹 2. Ligne par ligne
///
/// ```ts
/// import fs from "node:fs";
/// ```
/// ➜ Importe le module `fs` (File System) natif de Node.js.  
/// Ici, il n’est pas encore utilisé, mais il pourrait servir à :
/**
 * - vérifier la présence d’un dossier avant le démarrage (ex: ./uploads),
 * - créer un fichier de log,
 * - ou lire des certificats SSL pour un serveur HTTPS.
 */
///
/// ```ts
/// import app from "./app";
/// ```
/// ➜ Importe l’instance Express **déjà configurée** dans le fichier `app.ts`.
/// C’est elle qui contient tous les middlewares, routes et règles d’erreurs.
///
/// ```ts
/// import { env } from "./config/env";
/// ```
/// ➜ Récupère les **variables d’environnement typées** (dont le `PORT`)
/// grâce au fichier `env.ts`.
///
/// ----------------------------------------------------------------------------
/// 🔹 3. Lancement du serveur
///
/// ```ts
/// app.listen(env.PORT, () => {
///   console.log("API listening on port", env.PORT);
/// });
/// ```
/// ➜ Cette ligne démarre effectivement le serveur HTTP.
///
/// - `app.listen()` ouvre un port réseau et met Express à l’écoute des requêtes entrantes.  
/// - `env.PORT` détermine le port (par défaut `8080`, configurable via `.env`).  
/// - La fonction callback est exécutée une fois le serveur prêt, et affiche un message dans la console.
///
/// Exemple d’affichage :
/**
 * ✅ API listening on port 8080
 */
///
/// ----------------------------------------------------------------------------
/// 🔹 4. Vérification possible avant le démarrage
///
/// On pourrait ajouter une sécurité avant le `listen()` :
///
/// ```ts
/// if (!fs.existsSync(env.UPLOAD_DIR)) {
///   fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
///   console.log("✅ Dossier d'upload créé :", env.UPLOAD_DIR);
/// }
/// ```
///
/// Cela garantit que le répertoire utilisé pour les fichiers uploadés existe
/// avant que le serveur ne commence à écouter.
///
/// ----------------------------------------------------------------------------
/// 🔹 5. Différence entre `app.ts` et ce fichier
///
/// | Fichier | Rôle principal |
/// |----------|----------------|
/// | `app.ts` | Configure l’application Express : middlewares, routes, erreurs. |
/// | `index.ts` (ou `server.ts`) | Démarre réellement le serveur HTTP. |
///
/// ➜ **`app.ts` = cerveau**,  
/// **`index.ts` = interrupteur qui met le serveur en marche.**
///
/// ----------------------------------------------------------------------------
/// 🔹 6. Objectif pédagogique
///
/// Ce fichier illustre les **fondements d’un serveur Node/Express** :
/**
 * ✅ Comprendre le point d’entrée d’une application backend.
 * ✅ Savoir comment un serveur "écoute" sur un port.
 * ✅ Distinguer la configuration du serveur (app.ts) du lancement (index.ts).
 * ✅ Apprendre à gérer dynamiquement le port via les variables d’environnement.
 */
///
/// ----------------------------------------------------------------------------
/// 💡 En résumé :
/**
 * Ce fichier démarre le serveur Express sur le port défini dans `env.ts`.
 * Il constitue la dernière étape du cycle d’initialisation de l’application.
 *
 * ➤ En pratique :
 *   - `app.ts` prépare l’application.
 *   - `index.ts` la met en marche.
 *
 * 💡 Pédagogiquement :
 *   - Il montre aux étudiants comment se structure le démarrage d’un serveur.
 *   - Il relie les notions d’architecture (configuration + lancement).
 *   - Il illustre le flux complet de vie d’un backend Express moderne.
 */
/// ============================================================================
