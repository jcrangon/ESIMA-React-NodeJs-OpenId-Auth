import styled from "styled-components";

export const HeaderContainer = styled.header`
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadowSoft};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.main};
  position: sticky;
  top: 0;
  z-index: 1000;

  .inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
      text-shadow: 0 0 10px ${({ theme }) => theme.colors.focus};
    }
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1.5)};

    a {
      text-decoration: none;
      color: ${({ theme }) => theme.colors.text};
      font-weight: 500;
      transition: ${({ theme }) => theme.transition.fast};

      &:hover {
        color: ${({ theme }) => theme.colors.primaryHover};
      }
    }

    button {
      border: 1px solid ${({ theme }) => theme.colors.border};
      background: ${({ theme }) => theme.colors.surface};
      color: ${({ theme }) => theme.colors.text};
      border-radius: ${({ theme }) => theme.radius.button};
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: ${({ theme }) => theme.transition.fast};

      &:hover {
        background: ${({ theme }) => theme.colors.surfaceHover};
        color: ${({ theme }) => theme.colors.primary};
        box-shadow: 0 0 10px ${({ theme }) => theme.colors.focus};
      }
    }

    .user-info {
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors.textMuted};
      display: flex;
      align-items: center;
      gap: 0.4rem;

      .badge {
        font-size: 0.7rem;
        background: ${({ theme }) => theme.colors.background};
        color: ${({ theme }) => theme.colors.textMuted};
        border: 1px solid ${({ theme }) => theme.colors.border};
        border-radius: ${({ theme }) => theme.radius.button};
        padding: 0.15rem 0.4rem;
      }
    }
  }
`;

/* ============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — src/components/Header/style.ts
-------------------------------------------------------------------------------

Règle de conception :
---------------------
✅ Un seul styled-component racine : `HeaderContainer`
✅ Tous les sous-éléments (brand, nav, button, badge, etc.)
   sont stylés via des classes imbriquées (SASS-like)
✅ Palette 100% issue du `theme` sombre bleuté

Comportement visuel :
---------------------
- Fond légèrement bleuté (backgroundAlt)
- Texte clair (theme.colors.text)
- Hover bleu néon sur liens et bouton
- Ombre douce (shadowSoft)
- Badge "admin" discret, arrondi, gris bleuté

Responsabilité :
----------------
Ce composant n’a **aucune logique métier**.
Il se contente d’afficher les informations exposées par `AuthContext`.

Il peut être importé dans ton layout principal (ex: dans App ou un Layout global) :
<Header />
<Outlet />
============================================================================ */
