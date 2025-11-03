import styled from "styled-components";

export const HomePageContainer = styled.main`
  max-width: 900px;
  margin: ${({ theme }) => theme.spacing(2)} auto;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.card};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => theme.colors.shadowSoft},
    ${({ theme }) => theme.colors.shadowHard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.fonts.main};

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};

  .page-header {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1)};

    .title-row {
      display: flex;
      align-items: baseline;
      gap: ${({ theme }) => theme.spacing(1)};

      h1 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.text};
      }

      .badge-count {
        font-size: 0.75rem;
        line-height: 1;
        font-weight: 500;
        background: ${({ theme }) => theme.colors.backgroundAlt};
        color: ${({ theme }) => theme.colors.textMuted};
        border: 1px solid ${({ theme }) => theme.colors.border};
        border-radius: ${({ theme }) => theme.radius.button};
        padding: 0.25rem 0.5rem;
      }
    }

    .status-bar {
      font-size: 0.85rem;

      &.loading {
        color: ${({ theme }) => theme.colors.info};
      }

      &.error {
        color: ${({ theme }) => theme.colors.danger};
      }

      &.empty {
        color: ${({ theme }) => theme.colors.textMuted};
      }
    }
  }

  /* Liste des posts */
  .post-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing(1)};
  }

  .post-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: ${({ theme }) => theme.spacing(1)};
    padding: ${({ theme }) => theme.spacing(1.5)};
    border-radius: ${({ theme }) => theme.radius.card};
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: ${({ theme }) => theme.colors.shadowHard};
    transition: ${({ theme }) => theme.transition.fast};

    &:hover {
      background: ${({ theme }) => theme.colors.surfaceHover};
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 20px
        ${({ theme }) => theme.colors.focus};
    }
  }

  .post-cover {
    width: 80px;
    height: 80px;
    border-radius: ${({ theme }) => theme.radius.button};
    background-color: ${({ theme }) => theme.colors.background};
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  .post-main {
    display: flex;
    flex-direction: column;
    min-width: 0;

    .post-title {
        font-size: 1rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.text};
        line-height: 1.3;
        margin: 0 0 0.4rem 0;
        word-break: break-word;
    }

    .post-content {
      font-size: 0.9rem;
      line-height: 1.5;
      color: ${({ theme }) => theme.colors.textMuted};
      max-height: 3.6em; /* ~2 lignes */
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-word;
    }

    .post-meta {
      margin-top: 0.6rem;
      font-size: 0.75rem;
      color: ${({ theme }) => theme.colors.textDim};
      display: flex;
      flex-wrap: wrap;
      gap: ${({ theme }) => theme.spacing(1)};

      .author-block {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.4rem;

        .author-name {
          color: ${({ theme }) => theme.colors.text};
          font-weight: 500;
        }

        .role-badge {
          font-size: 0.7rem;
          line-height: 1;
          background: ${({ theme }) => theme.colors.background};
          color: ${({ theme }) => theme.colors.textMuted};
          border: 1px solid ${({ theme }) => theme.colors.border};
          border-radius: ${({ theme }) => theme.radius.button};
          padding: 0.15rem 0.4rem;
        }
      }

      .timestamps {
        display: flex;
        flex-wrap: wrap;
        column-gap: 0.5rem;
        row-gap: 0.25rem;
        color: ${({ theme }) => theme.colors.textDim};

        .created,
        .updated {
          white-space: nowrap;
        }
      }
    }
  }

  /* Barre de pagination */
  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.button};
    padding: ${({ theme }) => theme.spacing(1)};
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textDim};

    .info {
      color: ${({ theme }) => theme.colors.textDim};
    }

    .actions {
      display: flex;
      gap: ${({ theme }) => theme.spacing(1)};

      button {
        min-width: 5.5rem;
        text-align: center;

        border-radius: ${({ theme }) => theme.radius.button};
        border: 1px solid ${({ theme }) => theme.colors.border};
        background: ${({ theme }) => theme.colors.surface};
        color: ${({ theme }) => theme.colors.text};
        font-size: 0.8rem;
        font-weight: 500;
        line-height: 1;
        padding: 0.5rem 0.75rem;
        transition: ${({ theme }) => theme.transition.fast};

        &:hover:not(:disabled) {
          background: ${({ theme }) => theme.colors.surfaceHover};
          border-color: ${({ theme }) => theme.colors.primary};
          color: ${({ theme }) => theme.colors.primaryHover};
          box-shadow: 0 0 12px
            ${({ theme }) => theme.colors.focus};
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }
    }
  }
`;