import styled from "styled-components";

export const FooterContainer = styled.footer`
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.main};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  box-shadow: 0 -2px 8px ${({ theme }) => theme.colors.shadowSoft};
  margin-top: ${({ theme }) => theme.spacing(4)};

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${({ theme }) => theme.spacing(2)};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(1)};
  }

  .left {
    font-size: 0.85rem;

    .brand {
      color: ${({ theme }) => theme.colors.primary};
      font-weight: 600;
      margin-right: 0.4rem;
    }
  }

  .footer-nav {
    display: flex;
    gap: ${({ theme }) => theme.spacing(1.5)};

    a {
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors.textMuted};
      text-decoration: none;
      transition: ${({ theme }) => theme.transition.fast};

      &:hover {
        color: ${({ theme }) => theme.colors.primaryHover};
        text-shadow: 0 0 6px ${({ theme }) => theme.colors.focus};
      }
    }
  }
`;

/* ============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — src/components/Footer/style.ts
-------------------------------------------------------------------------------

Structure de style :
--------------------
✅ Un seul styled-component racine `FooterContainer`
✅ Sous-éléments imbriqués (.footer-inner, .left, .footer-nav)
✅ Palette issue du thème sombre bleuté :
   - Fond : backgroundAlt
   - Texte : textMuted
   - Lien hover : primaryHover (lueur bleutée)
   - Ombre : shadowSoft pour un effet flottant doux

Objectifs visuels :
-------------------
- Créer un contraste léger avec le fond principal (fond un peu plus clair)
- Séparer visuellement le contenu par un fin `border-top`
- Maintenir la cohérence avec le `Header` sans attirer l’attention excessive

Accessibilité :
----------------
- Taille de texte modérée (0.85rem)
- Couleurs contrastées (textMuted ↔ backgroundAlt)
- Hover bien visible pour la navigation au clavier ou à la souris

Intégration :
-------------
Tu peux l’ajouter dans ton `App.tsx` sous ton `<Routes />` :

<Header />
<Routes />
<Footer />

Cela garantit une présence globale dans toute l’application.
============================================================================ */
