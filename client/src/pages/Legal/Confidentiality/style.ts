import styled from "styled-components";

export const PageContainer = styled.main`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1rem;
  background: linear-gradient(
    180deg,
    var(--bg-page-start, #0a1624) 0%,
    var(--bg-page-end, #0f2133) 100%
  );
  color: var(--text-primary, #e6f0ff);
`;

export const Card = styled.section`
  width: 100%;
  max-width: 900px;
  background: rgba(15, 30, 50, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 2rem 2.25rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(156, 197, 255, 0.12);
`;

export const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 0.25rem;
  color: var(--accent, #9cc5ff);
`;

export const Subtitle = styled.h2`
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 1.5rem;
  color: rgba(230, 240, 255, 0.8);
`;

export const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 2rem 0 0.5rem;
  color: var(--accent, #9cc5ff);
`;

export const Text = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1rem;
  color: rgba(230, 240, 255, 0.92);

  strong {
    color: var(--text-strong, #ffffff);
    font-weight: 600;
  }
`;

export const BulletList = styled.ul`
  margin: 0 0 1rem 1.25rem;
  padding: 0;
  list-style: disc;
  color: rgba(230, 240, 255, 0.92);
`;

export const BulletItem = styled.li`
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
`;

export const SmallText = styled.p`
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: rgba(230, 240, 255, 0.55);
`;

export const BackButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
  border-radius: 10px;
  font-weight: 600;
  border: 0;
  cursor: pointer;
  background: radial-gradient(
    circle at 0% 0%,
    rgba(156, 197, 255, 0.14) 0%,
    rgba(80, 140, 220, 0.08) 60%
  );
  color: var(--accent, #9cc5ff);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(80, 140, 220, 0.4);

  transition: all 0.12s ease;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8),
      0 0 32px rgba(80, 140, 220, 0.6);
  }
`;

/*
RÉSUMÉ PÉDAGOGIQUE
- Style cohérent avec MentionsLegales :
  même fond dégradé bleu nuit, même carte en verre sombre.
- On ajoute BulletList et BulletItem parce que cette page a
  plus de listes (droits RGPD, finalités, etc.).
- Les couleurs utilisent des variables CSS fallback.
  Quand tu brancheras ton vrai thème via styled-components ThemeProvider,
  tu pourras remplacer ces var(--...) par props.theme.xxx si tu préfères.
- Le bouton Retour reprend la même logique UX / accessibilité / hover.
*/
