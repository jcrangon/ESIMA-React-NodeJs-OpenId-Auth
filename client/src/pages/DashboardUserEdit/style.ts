import styled from "styled-components";

export const DashboardUserEditPageContainer = styled.main`
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.main};
  padding-bottom: ${({ theme }) => theme.spacing(6)};

  .content-wrapper {
    max-width: 900px;
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing(4)};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
  }

  /* ----------------------------------------- */
  /* Header de page                            */
  /* ----------------------------------------- */
  .page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    row-gap: ${({ theme }) => theme.spacing(2)};
  }

  .page-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.2;
  }

  .page-subtitle {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-top: ${({ theme }) => theme.spacing(1)};
  }

  .back-btn {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.button};
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.875rem;
    font-weight: 500;
    padding: ${({ theme }) => theme.spacing(1)}
      ${({ theme }) => theme.spacing(2)};
    cursor: pointer;
    line-height: 1.2;
    transition: ${({ theme }) => theme.transition.fast};
    box-shadow: ${({ theme }) => theme.colors.shadowHard};

    &:hover {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  .solo-actions {
    display: flex;
    justify-content: flex-start;
  }

  /* ----------------------------------------- */
  /* Zones de status / feedback                */
  /* ----------------------------------------- */
  .status {
    border-radius: ${({ theme }) => theme.radius.card};
    padding: ${({ theme }) => theme.spacing(2)};
    font-size: 0.9rem;
    line-height: 1.4;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.colors.shadowSoft};
  }

  .status.loading {
    color: ${({ theme }) => theme.colors.info};
  }

  .status.error {
    color: ${({ theme }) => theme.colors.danger};
  }

  .feedback-block {
    border-radius: ${({ theme }) => theme.radius.card};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.colors.shadowSoft};
    padding: ${({ theme }) => theme.spacing(2)};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1)};
  }

  .server-error {
    color: ${({ theme }) => theme.colors.danger};
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .server-success {
    color: ${({ theme }) => theme.colors.success};
    font-size: 0.9rem;
    line-height: 1.4;
  }

  /* ----------------------------------------- */
  /* Carte infos utilisateur (lecture seule)   */
  /* ----------------------------------------- */
  .user-card {
    background-color: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.card};
    box-shadow: ${({ theme }) => theme.colors.shadowSoft};
    padding: ${({ theme }) => theme.spacing(3)};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    row-gap: ${({ theme }) => theme.spacing(1)};
    justify-content: space-between;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding-bottom: ${({ theme }) => theme.spacing(2)};
  }

  .row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .label {
    flex: 0 0 200px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.8rem;
    line-height: 1.4;
    font-weight: 500;
  }

  .value {
    flex: 1;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
    line-height: 1.4;
    word-break: break-word;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.2;
    padding: 0.3rem 0.5rem;
    border-radius: ${({ theme }) => theme.radius.round};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
    text-transform: lowercase;
    box-shadow: ${({ theme }) => theme.colors.shadowHard};
  }

  .role-badge.admin {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  /* ----------------------------------------- */
  /* Formulaire édition du rôle                */
  /* ----------------------------------------- */
  .edit-card {
    background-color: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.card};
    box-shadow: ${({ theme }) => theme.colors.shadowSoft};
    padding: ${({ theme }) => theme.spacing(3)};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
  }

  .sub-title {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.3;
  }

  .hint {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.warning};
    line-height: 1.4;
  }

  .form-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
  }

  .form-label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textMuted};
    min-width: 90px;
  }

  .role-select {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.button};
    padding: ${({ theme }) => theme.spacing(1)}
      ${({ theme }) => theme.spacing(2)};
    font-size: 0.9rem;
    line-height: 1.2;
    min-width: 180px;
    box-shadow: ${({ theme }) => theme.colors.shadowHard};
    cursor: pointer;
    transition: ${({ theme }) => theme.transition.fast};

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.focus};
      outline-offset: 2px;
      box-shadow: 0 0 12px ${({ theme }) => theme.colors.focus};
    }
  }

  .save-btn {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.radius.button};
    padding: ${({ theme }) => theme.spacing(1)}
      ${({ theme }) => theme.spacing(2)};
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.2;
    cursor: pointer;
    min-width: 140px;
    box-shadow: ${({ theme }) => theme.colors.shadowHard};
    transition: ${({ theme }) => theme.transition.fast};

    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryHover};
      border-color: ${({ theme }) => theme.colors.primaryHover};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
  }

  /* ----------------------------------------- */
  /* Responsive tweaks                         */
  /* ----------------------------------------- */
  @media (max-width: 600px) {
    .label {
      flex-basis: 100%;
    }
    .value {
      flex-basis: 100%;
    }

    .form-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .save-btn {
      width: 100%;
    }

    .back-btn {
      width: 100%;
      text-align: center;
    }
  }
`;
