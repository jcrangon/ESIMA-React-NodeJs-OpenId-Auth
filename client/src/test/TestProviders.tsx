import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { MemoryRouter, type MemoryRouterProps  } from "react-router-dom";
import { theme } from "@/styles/theme";

type Props = Readonly<{
  children: ReactNode;
  initialEntries?: MemoryRouterProps["initialEntries"]; // <- InitialEntry[] | undefined (mutable)
}>;

export function TestProviders({  children, initialEntries = ["/"] }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </ThemeProvider>
  );
}

/// ============================================================================
/// 📘 Résumé pédagogique — Contexte global pour les tests UI
/// ----------------------------------------------------------------------------
/// 🔹 Objectif du composant
/// Ce composant **entoure** les composants testés avec :
///
/// ✅ Un ThemeProvider (styled-components)  
/// ✅ Un MemoryRouter (React Router)  
///
/// Cela permet à tous les tests d’utiliser :
/// - le thème global
/// - les liens / navigation de React Router
///
/// sans avoir à répéter ces providers dans chaque test.
///
///
/// 🔹 Pourquoi `MemoryRouter` ?
/// - Simule la navigation **en mémoire** (pas de vrai historique navigateur)
/// - Idéal pour les tests unitaires + d’intégration
/// - Permet de tester la navigation (`initialEntries`, `history.push`, …)
///
///
/// 🔹 Typage des props (conforme SonarQube)
/// ✅ `Readonly<...>` → immuabilité des props  
/// ✅ `ReactNode` → accepte n’importe quel élément React  
/// ✅ `MemoryRouterProps['initialEntries']` → garantit le bon type attendu  
///
/// Cela protège le composant contre :
/// 🚫 modifications accidentelles des props  
/// 🚫 mauvais typages des routes initiales
///
///
/// 🔹 Utilisation simplifiée
/// Grâce à un utilitaire comme `render()` dans `test-utils.tsx` :
/**
  render(<MonComposant />, { route: "/login" });
*/
/// Tout le contexte est automatiquement appliqué ✅
///
/// ----------------------------------------------------------------------------
/// ✅ Résultat : des tests plus simples, lisibles et robustes
/// ============================================================================