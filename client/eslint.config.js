import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: [
      '**/*.{test,spec}.{ts,tsx}',
      'src/test/**/*.{ts,tsx}',   // inclut test-utils.tsx, TestProviders.tsx, etc.
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])


/// ============================================================================
/// 📘 Résumé pédagogique — ESLint Flat config pour Vite + React + TypeScript + Tests
/// ----------------------------------------------------------------------------
/// 🔹 Objectif du fichier
/// Fournir une configuration ESLint moderne garantissant :
/**
 ✅ Qualité et sécurité du code TypeScript
 ✅ Respect des bonnes pratiques React & Hooks
 ✅ Support de React Refresh en développement
 ✅ Tests proprement analysés (Vitest + RTL)
 */
///
/// 🔹 Flat Config : pourquoi ?
/**
 ✔ Successeur de .eslintrc
 ✔ Configuration plus explicite et modulaire
 ✔ Performances améliorées (idéal Docker + monorepo)
 */
///
/// 🔹 Décomposition par blocs
/**
 1️⃣ Ignorer dist (code généré)
 2️⃣ Règles principales du projet
 3️⃣ Exception pour les .d.ts (module augmentation → styled-components)
 4️⃣ Exception pour les fichiers de tests & utilitaires
 */
///
/// 🔹 Détails pédagogiques des overrides
///
/// ✅ `.d.ts` → règle désactivée :
/**
 @typescript-eslint/no-empty-object-type
 > Les fichiers de déclaration ne contiennent parfois qu’une augmentation de type
 > (ex : DefaultTheme styled-components). L’erreur serait un faux positif.
 */
///
/// ✅ Tests & tooling → règle désactivée :
/**
 react-refresh/only-export-components
 > Les tests ré-exportent des utilitaires (ex : Testing Library)
 > Fast Refresh ne s’applique pas aux tests → inutile / bloquant
 */
///
/// ----------------------------------------------------------------------------
/// ✅ Résultat final : 
/// Code maintenable, testé, lisible et **zéro faux positif** côté qualité ✅
/// ============================================================================