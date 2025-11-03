export const theme = {
  colors: {
    // 🌈 Couleurs principales
    primary: "#5B7CFF",          // Bleu clair indigo (accent principal)
    primaryHover: "#7A97FF",     // Hover plus lumineux, bleuté doux

    // 🌑 Thème sombre bleuté
    background: "#111827",       // Bleu nuit plus bleuté (vs #0f172a)
    backgroundAlt: "#162033",    // Légèrement plus lumineux (zones secondaires)
    surface: "#1c2742",          // Surfaces, cartes, panneaux
    surfaceHover: "#25335A",     // Survol bleuté
    border: "#334366",           // Bords bleus gris neutres

    // ✍️ Textes
    text: "#E3E9F7",             // Blanc bleuté (plus doux que pur blanc)
    textMuted: "#9FB2D1",        // Bleu gris clair
    textDim: "#7085A5",          // Métadonnées, timestamps

    // 🟢 États
    success: "#3CD1A4",
    warning: "#F7D154",
    danger: "#F87171",
    info: "#60A5FA",

    // ✨ Focus / sélection
    focus: "rgba(91, 124, 255, 0.55)",    // halo bleuté
    selection: "rgba(91, 124, 255, 0.35)", // fond sélection textuelle

    // 🌫 Ombres
    shadowSoft: "0 20px 60px rgba(0, 0, 0, 0.55)",
    shadowHard: "0 2px 6px rgba(0, 0, 0, 0.45)",
    // 🎨 Autres couleurs spécifiques
    bgGradientStart: "#0f172a", // bleu nuit
    bgGradientEnd: "#1e293b",   // bleu/gris
    surfaceCard: "rgba(30,41,59,0.6)",
    surfaceInput: "rgba(15,23,42,0.6)",
    borderDimmed: "rgba(148,163,184,0.15)",
    textPrimary: "#f8fafc",
    textDimmed: "#94a3b8",
    textPlaceholder: "#64748b",
    accent: "#4f46e5",
    onAccent: "#ffffff",
    accentFocusRing: "rgba(79,70,229,0.4)",
    dangerBorder: "rgba(248,113,113,0.4)",
  },

  // 🔤 Polices
  fonts: {
    main: `system-ui, -apple-system, BlinkMacSystemFont, "Inter",
           Roboto, "Segoe UI", Oxygen, Ubuntu, Cantarell,
           "Open Sans", sans-serif`,
    mono: `"Fira Code", Menlo, Monaco, Consolas, "Courier New", monospace`,
  },

  // 📏 Rythme & transitions
  spacing: (factor: number) => `${factor * 8}px`,

  radius: {
    card: "12px",
    button: "8px",
    round: "999px",
  },

  transition: {
    fast: "all 0.15s ease-in-out",
    normal: "all 0.3s ease",
  },
} as const;

export type ThemeType = typeof theme;

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — theme.ts
===============================================================================

🎯 Objectif
-----------
Ce fichier définit notre thème global sombre et légèrement BLEUTÉ.
Toutes les couleurs, espacements, ombres, polices partent d’ici.

Pourquoi c'est important ?
--------------------------
- Au lieu d'écrire des couleurs en dur dans chaque composant,
  on lit `theme.colors.xxx`.
- Changer l’identité visuelle = changer ce fichier → toute l'app suit.
- Le thème est typé (grâce à `as const` + `ThemeType`), donc :
  - tu as l’autocomplétion dans styled-components,
  - toute faute de frappe lève une erreur TypeScript.

Choix de palette
----------------
- background = `#0f172a` (bleu nuit profond, pas noir pur → confort visuel)
- backgroundAlt / surface = bleus/gris froids (`#1e2539`, `#1f293f`)
- border = bleu gris désaturé (`#2f385a`) → pas de gris chaud
- text / textMuted / textDim = blanc froid + gris bleuté
- primary = indigo/bleu violacé (#6272FF) pour coller à ton souhait "léger bleu"
  → c'est la couleur des CTA et des focus states.

Accessibilité
-------------
- `text` est très clair sur `background` (excellent contraste)
- `textMuted` et `textDim` sont encore lisibles mais n'attirent pas l'œil
- `focus` / `selection` utilisent une aura bleutée, pas un orange/jaune
  agressif. Le focus reste visible dans un thème sombre.

Pratiques pro
-------------
- `spacing(factor)` donne une échelle de layout cohérente.
- `radius` centralise les arrondis, pour éviter `border-radius: 7px` random.
- `transition` donne une identité d'animation fluide cohérente.

En clair :
----------
Le thème donne la personnalité visuelle du produit.
On va l'utiliser partout via ThemeProvider dans `main.tsx`.
============================================================================= */
