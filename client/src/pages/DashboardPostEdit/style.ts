import styled from "styled-components";

export const DashboardPostEditPageContainer = styled.main`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .content-wrapper {
    flex: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing(4)};
  }

  .page-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  .page-title {
    font-size: 1.8rem;
    font-weight: 600;
  }

  .page-subtitle {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textDim};
  }

  .back-btn {
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.button};
    color: ${({ theme }) => theme.colors.text};
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: ${({ theme }) => theme.transition.fast};
    &:hover {
      background: ${({ theme }) => theme.colors.surfaceHover};
    }
  }

  .feedback-block {
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  .server-error {
    color: ${({ theme }) => theme.colors.danger};
  }

  .server-success {
    color: ${({ theme }) => theme.colors.success};
  }

  .form-card {
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.card};
    box-shadow: ${({ theme }) => theme.colors.shadowSoft};
    padding: ${({ theme }) => theme.spacing(4)};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(3)};
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    display: flex;
    justify-content: space-between;
    font-weight: 500;
  }

  .error {
    color: ${({ theme }) => theme.colors.danger};
    font-size: 0.85rem;
  }

  .text-input,
  .textarea-input,
  .file-input {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.button};
    padding: 0.6rem 0.8rem;
    font-size: 1rem;
    width: 100%;
    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.focus};
    }
  }

  .cover-preview img {
    max-width: 200px;
    height: auto;
    margin-bottom: ${({ theme }) => theme.spacing(1)};
    border-radius: ${({ theme }) => theme.radius.card};
  }

  .actions-row {
    display: flex;
    justify-content: flex-end;
    gap: ${({ theme }) => theme.spacing(2)};
  }

  .cancel-btn {
    background: transparent;
    color: ${({ theme }) => theme.colors.textDim};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.button};
    padding: 0.5rem 1rem;
    cursor: pointer;
    &:hover {
      background: ${({ theme }) => theme.colors.surfaceHover};
    }
  }

  .submit-btn {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.radius.button};
    padding: 0.5rem 1.2rem;
    cursor: pointer;
    transition: ${({ theme }) => theme.transition.fast};
    &:hover {
      background: ${({ theme }) => theme.colors.primaryHover};
    }
  }
`;
