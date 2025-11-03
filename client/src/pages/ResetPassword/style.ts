import styled from "styled-components";

export const ResetPasswordPageContainer = styled.main`
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

  .card {
    width: 100%;
    max-width: 400px;
    background: rgba(15, 30, 50, 0.6);
    border: 1px solid rgba(156, 197, 255, 0.12);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
    border-radius: 12px;
    padding: 2rem;
  }

  .title {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--accent, #9cc5ff);
  }

  .subtitle {
    font-size: 0.9rem;
    color: rgba(230, 240, 255, 0.75);
    margin: 0 0 1.5rem;
    line-height: 1.4;
  }

  .warning {
    background: rgba(255, 120, 120, 0.1);
    border: 1px solid rgba(255, 120, 120, 0.4);
    color: rgba(255, 160, 160, 0.9);
    border-radius: 8px;
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  .field label {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(230, 240, 255, 0.88);
    margin-bottom: 0.4rem;
  }

  .field .error {
    color: rgba(255, 120, 120, 0.95);
    font-size: 0.8rem;
    font-weight: 500;
    margin-left: 0.5rem;
  }

  .field input {
    border-radius: 8px;
    border: 1px solid rgba(156, 197, 255, 0.06);
    background: rgba(10, 18, 28, 0.45);
    color: var(--text-primary, #e6f0ff);
    padding: 10px 12px;
    font-size: 0.95rem;
    outline: none;
  }

  .field input:focus {
    box-shadow: 0 8px 20px rgba(80, 140, 220, 0.08);
    border-color: rgba(156, 197, 255, 0.26);
  }

  .error-block {
    color: rgba(255, 120, 120, 0.95);
    background: rgba(255, 120, 120, 0.08);
    border-radius: 8px;
    border: 1px solid rgba(255, 120, 120, 0.4);
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
  }

  .server-msg {
    font-size: 0.85rem;
    line-height: 1.4;
    color: rgba(230, 240, 255, 0.8);
    background: rgba(10, 18, 28, 0.4);
    border-radius: 8px;
    border: 1px solid rgba(156, 197, 255, 0.12);
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .submit-btn {
    flex: 1;
    min-width: 140px;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    background: radial-gradient(
      circle at 0% 0%,
      rgba(156, 197, 255, 0.14) 0%,
      rgba(80, 140, 220, 0.12) 60%
    );
    color: var(--accent, #9cc5ff);
    padding: 10px 14px;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6),
      0 0 20px rgba(80, 140, 220, 0.4);
    transition: all 0.12s ease;
  }

  .submit-btn:hover {
    transform: translateY(-2px) scale(1.02);
  }

  .cancel-btn {
    flex: 1;
    min-width: 140px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: transparent;
    color: rgba(230, 240, 255, 0.8);
    cursor: pointer;
    padding: 10px 14px;
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;
