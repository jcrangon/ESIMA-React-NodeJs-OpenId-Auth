import styled from "styled-components";

export const DashboardPostNewPageContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(
    circle at 20% 20%,
    ${({ theme }) => theme.colors.bgGradientStart},
    ${({ theme }) => theme.colors.bgGradientEnd} 70%
  );
  color: ${({ theme }) => theme.colors.textPrimary};

  display: flex;
  flex-direction: column;

  .content-wrapper {
    width: 100%;
    max-width: 900px;
    margin: 2rem auto 4rem;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* HEADER DE PAGE */
  .page-head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    row-gap: 0.75rem;

    .page-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.textPrimary};
    }

    .page-subtitle {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.textDimmed};
      line-height: 1.4;
    }

    .back-btn {
      background: transparent;
      border: 1px solid ${({ theme }) => theme.colors.borderDimmed};
      border-radius: 0.5rem;
      font-size: 0.9rem;
      padding: 0.5rem 0.75rem;
      color: ${({ theme }) => theme.colors.textPrimary};
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: ${({ theme }) => theme.colors.surfaceHover};
      }
    }
  }

  /* BLOC DE FEEDBACK GLOBAL (erreur / succès) */
  .feedback-block {
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    background: ${({ theme }) => theme.colors.surfaceCard};
    border: 1px solid ${({ theme }) => theme.colors.borderDimmed};

    .server-error {
      color: ${({ theme }) => theme.colors.danger};
      font-size: 0.9rem;
      line-height: 1.4;
      margin: 0;
    }

    .server-success {
      color: ${({ theme }) => theme.colors.success};
      font-size: 0.9rem;
      line-height: 1.4;
      margin: 0;
    }
  }

  /* CARTE FORMULAIRE */
  .form-card {
    background: ${({ theme }) => theme.colors.surfaceCard};
    border: 1px solid ${({ theme }) => theme.colors.borderDimmed};
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    row-gap: 1.25rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
  }

  .form-label {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.75rem;
    align-items: baseline;

    span {
      font-size: 0.9rem;
      line-height: 1.3;
      color: ${({ theme }) => theme.colors.textPrimary};
    }

    .error {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.danger};
    }
  }

  .text-input,
  .textarea-input {
    width: 100%;
    background: ${({ theme }) => theme.colors.surfaceInput};
    color: ${({ theme }) => theme.colors.textPrimary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 0.5rem;
    padding: 0.75rem 0.8rem;
    font-size: 0.95rem;
    line-height: 1.4;
    outline: none;
    transition: all 0.15s;

    &::placeholder {
      color: ${({ theme }) => theme.colors.textPlaceholder};
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.accent};
      box-shadow: 0 0 0 3px
        ${({ theme }) => theme.colors.accentFocusRing};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .textarea-input {
    resize: vertical;
    min-height: 8rem;
  }

  .hint {
    margin-top: -0.25rem;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textDimmed};
    line-height: 1.3;
  }

  /* ACTIONS BAS FORM */
  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .cancel-btn {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.borderDimmed};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 0.9rem;
    line-height: 1.2;
    padding: 0.6rem 0.9rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.surfaceHover};
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .submit-btn {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.onAccent};
    border: none;
    font-size: 0.9rem;
    line-height: 1.2;
    padding: 0.6rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
    transition: all 0.15s;

    &:hover:not(:disabled) {
      filter: brightness(1.1);
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.8);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  /* états généraux */
  .status {
    font-size: 0.9rem;
    line-height: 1.4;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;

    &.error {
      color: ${({ theme }) => theme.colors.danger};
      background: ${({ theme }) => theme.colors.surfaceCard};
      border: 1px solid ${({ theme }) => theme.colors.dangerBorder};
    }

    &.loading {
      color: ${({ theme }) => theme.colors.textDimmed};
      background: ${({ theme }) => theme.colors.surfaceCard};
      border: 1px solid ${({ theme }) => theme.colors.borderDimmed};
      font-style: italic;
    }
      .file-input {
        width: 100%;
        padding: ${({ theme }) => theme.spacing(1)};
        color: ${({ theme }) => theme.colors.textDim};
        background: ${({ theme }) => theme.colors.backgroundAlt};
        border: 1px dashed ${({ theme }) => theme.colors.border};
        border-radius: ${({ theme }) => theme.radius.button};
        transition: ${({ theme }) => theme.transition.fast};
        cursor: pointer;
      
        &:hover {
          border-color: ${({ theme }) => theme.colors.primary};
          background: ${({ theme }) => theme.colors.surfaceHover};
        }
      }
      
      .preview {
        margin-top: ${({ theme }) => theme.spacing(1)};
        display: flex;
        justify-content: flex-start;
      
        .preview-img {
          max-width: 200px;
          border-radius: ${({ theme }) => theme.radius.card};
          box-shadow: ${({ theme }) => theme.colors.shadowSoft};
        }
      }
  }
`;
