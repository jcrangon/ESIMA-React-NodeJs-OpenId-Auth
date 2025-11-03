import styled from "styled-components";

export const PageContainer = styled.main`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1rem;
  background: linear-gradient(
    180deg,
    var(--bg-page-start, #071422) 0%,
    var(--bg-page-end, #0b2536) 100%
  );
  color: var(--text-primary, #e6f0ff);
`;

export const Card = styled.section`
  width: 100%;
  max-width: 820px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 20px 50px rgba(2,12,27,0.6);
  border: 1px solid rgba(255,255,255,0.03);
`;

export const Title = styled.h1`
  margin: 0 0 4px;
  font-size: 1.3rem;
  color: var(--accent, #9cc5ff);
  font-weight: 700;
`;

export const Subtitle = styled.h2`
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: rgba(230,240,255,0.8);
  font-weight: 500;
`;

export const Form = styled.form`
  margin-top: 8px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
`;

export const Label = styled.label`
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: rgba(230,240,255,0.88);
  font-weight: 600;
`;

export const Input = styled.input`
  font-size: 0.95rem;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(156,197,255,0.06);
  background: rgba(10, 18, 28, 0.45);
  color: var(--text-primary, #e6f0ff);
  outline: none;

  &:focus {
    box-shadow: 0 8px 20px rgba(80,140,220,0.08);
    border-color: rgba(156,197,255,0.26);
  }
`;

export const Textarea = styled.textarea`
  font-size: 0.95rem;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(156,197,255,0.06);
  background: rgba(10, 18, 28, 0.45);
  color: var(--text-primary, #e6f0ff);
  outline: none;
  resize: vertical;
  min-height: 120px;

  &:focus {
    box-shadow: 0 8px 20px rgba(80,140,220,0.08);
    border-color: rgba(156,197,255,0.26);
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  align-items: center;
`;

export const SubmitButton = styled.button`
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  background: linear-gradient(90deg, rgba(156,197,255,0.14), rgba(80,140,220,0.12));
  color: var(--accent, #9cc5ff);
  cursor: pointer;
  box-shadow: 0 14px 32px rgba(8,20,40,0.45);

  &:hover {
    transform: translateY(-2px);
  }
`;

export const CancelButton = styled.button`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.04);
  background: transparent;
  color: rgba(230,240,255,0.9);
  cursor: pointer;

  &:hover {
    background: rgba(255,255,255,0.02);
  }
`;

export const HelpText = styled.span`
  margin-top: 6px;
  font-size: 0.85rem;
  color: rgba(255, 120, 120, 0.95);
`;

export const Notice = styled.p`
  margin-top: 14px;
  font-size: 0.9rem;
  color: rgba(230,240,255,0.78);
  background: rgba(10, 18, 28, 0.25);
  padding: 10px 12px;
  border-radius: 8px;
`;

/*
RÉSUMÉ PÉDAGOGIQUE (style)
- Respect du thème sombre bleuté : variables CSS fallback et accents bleu clair.
- Inputs / textarea ont un background sombre semi-translucide pour effet "glass".
- Boutons : style cohérent avec les autres pages (SubmitButton = accentué, CancelButton = secondaire).
- Accessibilité : spacing + tailles de police lisibles, focus visible.
- Intégration : si tu utilises un ThemeProvider, tu peux remplacer les var(--...) par props.theme.*
*/
