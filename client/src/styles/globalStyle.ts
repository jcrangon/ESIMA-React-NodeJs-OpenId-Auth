// src/styles/globalStyle.ts
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`

  /* Reset de base + meilleur box model */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* On enlève marges par défaut du body et on applique le thème global */
  body {
    margin: 0;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.main};
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;

    /* plein écran dark légèrement bleuté */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Liens par défaut → utilisent la couleur primaire */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
      text-decoration: underline;
    }
  }

  /* Boutons nus (ex: <button>) */
  button {
    font-family: inherit;
    cursor: pointer;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.text};
  }

  /* Sélection texte bleutée, pas violet par défaut du navigateur */
  ::selection {
    background: ${({ theme }) => theme.colors.selection};
    color: ${({ theme }) => theme.colors.text};
  }

  /* Scrollbar custom (chromium/webkit). Optionnel mais propre en dark mode */
  ::-webkit-scrollbar {
    width: 8px;
    background-color: ${({ theme }) => theme.colors.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radius.button};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }

`;



/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — globalStyle.ts
===============================================================================

Rôle
----
GlobalStyle remplace ton ancien index.css global.
Il est injecté une seule fois au plus haut niveau de l’app (dans main.tsx).
Il utilise le thème typé `theme` pour tout ce qui est global.

Ce qu’on fait ici :
-------------------
1. On force `box-sizing: border-box` partout
   → ça évite les surprises de largeur/hauteur en CSS moderne.

2. On installe le fond global sombre bleuté
   (`background-color: theme.colors.background`)
   et la couleur de texte claire (`theme.colors.text`) directement sur <body>.

3. On définit une typo système moderne lisible
   (`theme.fonts.main`) et l’anti-aliasing.

4. On harmonise les `<a>` :
   - couleur = `theme.colors.primary` (bleu indigo du thème)
   - hover = `primaryHover`
   - on choisit underline seulement au hover → style sobre.

5. On s'occupe de `::selection` :
   Quand tu surlignes du texte, le fond de sélection utilise
   `theme.colors.selection` (un bleu semi-transparent)
   au lieu du bleu/violet moche par défaut du navigateur.

6. Bonus UX : scrollbars sombres customisées pour rester cohérent
   avec ton ambiance "dark légèrement bleuté".

Pourquoi c’est important ?
--------------------------
- Le ressenti dark/bleu vient d’abord du body global.
- Si tu crées une page ou un composant et que tu oublies le style,
  visuellement c’est déjà cohérent parce que le body est bon.
- Tous les containers styled-components que tu vas faire héritent déjà
  des bonnes couleurs, typos et ombres.

Intégration dans ton app
------------------------
Tu fais déjà ça dans `main.tsx` :

  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>

Résultat
--------
Tu as maintenant :
- un thème sombre bleuté cohérent visuellement,
- typé,
- injecté partout,
- prêt pour les composants/pages qu’on va créer dans `src/pages` et `src/components`.

============================================================================= */
