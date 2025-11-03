import styled from "styled-components";

export const LoginPageContainer = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 20% 20%,
    rgba(20, 32, 60, 0.9) 0%,
    rgba(10, 14, 24, 1) 70%
  );
  padding: 2rem;
  color: #f0f4ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", Roboto,
    "Segoe UI", sans-serif;

  .card {
    width: 100%;
    max-width: 400px;
    background: rgba(30, 40, 70, 0.6);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(80, 120, 255, 0.25);
    border-radius: 1rem;
    padding: 2rem 1.5rem;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card-header {
    text-align: center;

    .title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
      line-height: 1.3;
    }

    .subtitle {
      font-size: 0.9rem;
      font-weight: 400;
      color: #9da8d8;
      margin: 0.4rem 0 0;
      line-height: 1.4;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 500;
      color: #cfd8ff;

      .error {
        font-size: 0.7rem;
        font-weight: 400;
        color: #ff6b6b;
        margin-left: 0.5rem;
      }
    }

    input {
      width: 100%;
      background: rgba(8, 10, 20, 0.6);
      border: 1px solid rgba(100, 130, 255, 0.3);
      border-radius: 0.5rem;
      color: #f0f4ff;
      padding: 0.7rem 0.8rem;
      font-size: 0.9rem;
      line-height: 1.4;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;

      &::placeholder {
        color: #6571a8;
      }

      &:focus {
        border-color: rgba(120, 150, 255, 0.8);
        box-shadow: 0 0 8px rgba(80, 120, 255, 0.6);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .remember-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.8rem;
    color: #cfd8ff;

    input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      accent-color: #4c6fff;
      cursor: pointer;
    }

    label {
      cursor: pointer;
      line-height: 1.3;
    }
  }

  .feedback {
    min-height: 2.2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .server-error {
      background: rgba(255, 0, 76, 0.12);
      border: 1px solid rgba(255, 0, 76, 0.4);
      color: #ff6b6b;
      font-size: 0.75rem;
      line-height: 1.3;
      padding: 0.6rem 0.8rem;
      border-radius: 0.5rem;
      font-weight: 500;
    }

    .server-success {
      background: rgba(0, 180, 120, 0.12);
      border: 1px solid rgba(0, 180, 120, 0.4);
      color: #4be0a5;
      font-size: 0.75rem;
      line-height: 1.3;
      padding: 0.6rem 0.8rem;
      border-radius: 0.5rem;
      font-weight: 500;
    }
  }

  .submit-block {
    margin-top: 0.5rem;
  }

  .submit-btn {
    width: 100%;
    background: radial-gradient(
      circle at 20% 20%,
      rgba(80, 120, 255, 0.9) 0%,
      rgba(40, 60, 140, 0.8) 60%
    );
    border: 1px solid rgba(120, 150, 255, 0.5);
    border-radius: 0.6rem;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    line-height: 1.3;
    cursor: pointer;
    box-shadow: 0 20px 40px rgba(30, 40, 100, 0.8),
      0 2px 4px rgba(0, 0, 0, 0.8);
    transition: box-shadow 0.15s, filter 0.15s, opacity 0.15s;

    &:hover {
      box-shadow: 0 24px 60px rgba(50, 80, 200, 0.9),
        0 4px 8px rgba(0, 0, 0, 0.9);
      filter: brightness(1.06);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: none;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.6);
    }
  }

  @media (max-width: 480px) {
    .card {
      padding: 1.5rem 1.25rem;
      border-radius: 0.75rem;
    }

    .card-header .title {
      font-size: 1.15rem;
    }

    .card-header .subtitle {
      font-size: 0.8rem;
    }

    .submit-btn {
      font-size: 0.85rem;
    }
  }
};
`