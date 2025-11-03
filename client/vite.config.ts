import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") }
  },
  server: {
    host: true,         // écoute sur 0.0.0.0 dans le conteneur
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // <— force le watcher à sonder le FS
      interval: 300
    },
    hmr: {
      host: "localhost", // <— le navigateur se connecte à l’hôte
      port: 5173         //     (le port mappé)
      // clientPort: 5173 // alternative
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    css: true, // permet d'importer du CSS/SC dans les tests
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/__tests__/**", "src/**/*.d.ts"],
    },
  },
  preview: { port: 5173, strictPort: true },
  envPrefix: "VITE_",
  optimizeDeps: { include: ["styled-components"] }
  
});

/// ============================================================================
/// 📘 Résumé pédagogique — Configuration Vite + Vitest + Docker
/// ----------------------------------------------------------------------------
/// 🔹 Objectif du fichier
/// Ce fichier configure l’environnement de développement et de test :
///  - React + JSX / TS
///  - Docker-friendly HMR
///  - Alias `@` pour simplifier les imports
///  - Vitest (tests unitaires + coverage)
///
/// 🔹 Sections clés
/// ✔ `plugins` → ajoute la gestion React dans Vite  
/// ✔ `resolve.alias` → autorise import "@/components/Button"  
/// ✔ `server` → hot reload fiable dans Docker / WSL  
/// ✔ `test` → configure Vitest + RTL + jsdom  
/// ✔ `envPrefix` → assure que seules les variables `VITE_` sont exposées au front  
/// ✔ `optimizeDeps.include` → compile `styled-components` à l’avance pour éviter les lenteurs
///
/// 🔹 Pourquoi jsdom en test ?
/// Simule le navigateur → tests fiables sur composants React
///
/// 🔹 Pourquoi `globals: true`
/// Permet d’utiliser `describe`, `it`, `expect` sans import explicite
///
/// 🔹 Pourquoi `coverage`
/// Génère des rapports lisibles pour vérifier la couverture du code
///
/// ----------------------------------------------------------------------------
/// ✅ Résultat : une configuration prête pour le dev moderne & les tests pro
/// ============================================================================