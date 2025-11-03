// src/pages/RegisterPage/style.ts
import styled from "styled-components";

export const RegisterPageContainer = styled.main`
  min-height: 100vh;
  width: 100%;
  background-color: #0d111a; /* fond global très sombre tirant bleu/gris */
  background-image: radial-gradient(
    circle at 20% 20%,
    rgba(40, 54, 85, 0.4) 0%,
    rgba(13, 17, 26, 0) 70%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e9ecff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", Roboto,
    "Helvetica Neue", Arial, sans-serif;

  .card {
    width: 100%;
    max-width: 380px;
    background-color: rgba(20, 26, 40, 0.9); /* panneau sombre bleuté */
    border: 1px solid rgba(90, 110, 160, 0.35); /* contour discret bleu acier */
    border-radius: 0.75rem;
    padding: 1.5rem 1.5rem 2rem;
    box-shadow:
      0 24px 40px rgba(0, 0, 0, 0.8),
      0 4px 16px rgba(0, 0, 0, 0.6);
  }

  .card-header {
    margin-bottom: 1.5rem;
    text-align: center;

    .title {
      color: #f0f3ff;
      font-size: 1.2rem;
      font-weight: 600;
      line-height: 1.2;
      margin: 0 0 0.4rem;
    }

    .subtitle {
      color: #8d99c9;
      font-size: 0.8rem;
      font-weight: 400;
      margin: 0;
    }
  }

  form {
    display: grid;
    row-gap: 1rem;
  }

  .field {
    display: grid;
    row-gap: 0.5rem;

    label {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 0.75rem;
      font-weight: 500;
      color: #b7c3ff;

      .error {
        color: #ff6b6b;
        font-weight: 400;
        font-size: 0.7rem;
        margin-left: 0.5rem;
      }
    }

    input[type="text"],
    input[type="email"],
    input[type="password"] {
      width: 100%;
      background-color: rgba(13, 17, 26, 0.6); /* champ très sombre */
      border: 1px solid rgba(100, 120, 190, 0.4);
      border-radius: 0.5rem;
      padding: 0.7rem 0.8rem;
      font-size: 0.85rem;
      font-weight: 400;
      line-height: 1.2;
      color: #eef1ff;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;

      &::placeholder {
        color: #566083;
      }

      &:focus {
        background-color: rgba(13, 17, 26, 0.8);
        border-color: rgba(130, 160, 255, 0.8);
        box-shadow: 0 0 0 3px rgba(80, 110, 255, 0.35);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .row-2col {
    display: grid;
    column-gap: 1rem;
    row-gap: 1rem;
    grid-template-columns: 1fr 1fr;

    @media (max-width: 400px) {
      grid-template-columns: 1fr;
    }
  }

  .remember-row {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;

    input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      cursor: pointer;
      accent-color: rgb(112, 140, 255); /* couleur bleutée cohérente */
    }

    label {
      font-size: 0.75rem;
      font-weight: 400;
      color: #b7c3ff;
      cursor: pointer;
      line-height: 1.2;
    }
  }

  .feedback {
    min-height: 1.2em;
    font-size: 0.75rem;
    line-height: 1.3;

    .server-error {
      color: #ff6b6b;
      font-weight: 500;
      margin: 0;
    }

    .server-success {
      color: #5cff9d;
      font-weight: 500;
      margin: 0;
    }
  }

  .submit-block {
    display: grid;
    row-gap: 0.5rem;
  }

  .submit-btn {
    appearance: none;
    border: 0;
    border-radius: 0.5rem;
    cursor: pointer;
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.2;
    text-align: center;
    color: #0f1220;
    background-image: linear-gradient(
      90deg,
      rgba(80, 110, 255, 1) 0%,
      rgba(130, 160, 255, 1) 100%
    );
    box-shadow:
      0 16px 32px rgba(40, 60, 140, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.8);

    transition: box-shadow 0.15s, transform 0.1s;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }

    &:not(:disabled):hover {
      box-shadow:
        0 20px 36px rgba(40, 60, 140, 0.6),
        0 4px 12px rgba(0, 0, 0, 0.8);
      transform: translateY(-1px);
    }

    &:not(:disabled):active {
      transform: translateY(0);
      box-shadow:
        0 12px 24px rgba(40, 60, 140, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.8);
    }
  }
`;
