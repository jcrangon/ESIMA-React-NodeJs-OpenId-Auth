import "styled-components";
import type { ThemeType } from "./theme";

declare module "styled-components" {
  export interface DefaultTheme extends ThemeType {}
}


/// ============================================================================
/// 📘 Résumé pédagogique — Gestion d’un thème UI avec styled-components
/// ----------------------------------------------------------------------------
/// 🔹 Objectif du fichier
/// Ce fichier définit un **thème centralisé** pour toute l’application.
/// Grâce à styled-components et au TypeScript, on peut utiliser ces valeurs
/// dans tous les composants avec auto-complétion et sécurité de types.
///
/// 🔹 Intérêt du thème
/// ✔ Assure la cohérence graphique globale (couleurs, typo, spacing…)  
/// ✔ Evite les valeurs écrites "en dur" dans les composants (anti-duplication)  
/// ✔ Permet de **changer l’identité visuelle rapidement** (dark/light theme…)  
/// ✔ Facilite l’accessibilité et la maintenance de l’UI
///
/// 🔹 Structure du thème
/// - `colors` : toutes les couleurs utilisées par l’interface
/// - `fonts` : polices principales et alternatives
/// - `spacing` : échelle d’espacement réutilisable (`factor × 8px`)
/// - `radius` : arrondi uniformisé des éléments UI
/// - `transition` : transitions par défaut des animations UI
///
/// 🔹 Typage automatique
/// La ligne `as const` permet à TypeScript de figer les valeurs et de créer
/// un type précis et immuable.  
/// Puis `ThemeType = typeof theme` permet au reste du projet de connaître
/// exactement la structure du thème (autocomplétion dans les composants).
///
/// 🔹 Fonctionnement avec styled-components
/// Le fichier `styled.d.ts` fusionne ce type avec `DefaultTheme`, de sorte
/// que `({ theme }) => theme.colors.primary` soit **totalement typé**.
/// ============================================================================