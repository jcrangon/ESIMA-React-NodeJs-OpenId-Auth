// src/pages/PostPage/style.ts
import styled from "styled-components";

export const PostPageContainer = styled.main`
  min-height: 100vh;
  background: radial-gradient(
    circle at 20% 20%,
    rgba(20, 32, 60, 0.9) 0%,
    rgba(10, 14, 24, 1) 70%
  );
  color: #f0f4ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", Roboto,
    "Segoe UI", sans-serif;
  display: flex;
  flex-direction: column;

  .article-wrapper {
    max-width: 900px;
    width: 100%;
    margin: 2rem auto;
    padding: 1rem 1.25rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .status {
    font-size: 0.9rem;
    font-weight: 500;
    padding: 0.8rem 1rem;
    border-radius: 0.6rem;
    line-height: 1.4;

    &.loading {
      background: rgba(80, 120, 255, 0.12);
      border: 1px solid rgba(80, 120, 255, 0.4);
      color: #9bb1ff;
    }

    &.error {
      background: rgba(255, 0, 76, 0.12);
      border: 1px solid rgba(255, 0, 76, 0.4);
      color: #ff6b6b;
    }

    &.empty {
      background: rgba(120, 120, 120, 0.12);
      border: 1px solid rgba(160, 160, 160, 0.4);
      color: #cfd8ff;
    }
  }

  .article-card {
    background: rgba(30, 40, 70, 0.6);
    border: 1px solid rgba(80, 120, 255, 0.25);
    border-radius: 1rem;
    box-shadow: 0 35px 80px rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    height: 220px;
    background-size: cover;
    background-position: center center;
    background-color: #1c2742;
    border-bottom: 1px solid rgba(80, 120, 255, 0.2);
  }

  .article-main {
    display: flex;
    flex-direction: column;
    padding: 1.25rem 1rem 2rem;
    gap: 1rem;
  }

  .article-head {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .article-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.3;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  }

  .meta-block {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    @media (min-width: 500px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }
  }

  .author-side {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.5rem;

    .author-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: #cfd8ff;
    }

    .role-badge {
      background: rgba(80, 120, 255, 0.15);
      border: 1px solid rgba(80, 120, 255, 0.4);
      color: #9bb1ff;
      font-size: 0.7rem;
      font-weight: 500;
      line-height: 1.2;
      padding: 0.25rem 0.5rem;
      border-radius: 0.4rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
  }

  .time-side {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #9da8d8;

    .post-id {
      color: #6571a8;
      font-size: 0.7rem;
    }
  }

  .article-body {
    .article-content {
      font-size: 0.9rem;
      line-height: 1.5;
      font-weight: 400;
      color: #e6e9ff;
      white-space: pre-line; /* préserve les sauts de ligne si ton contenu en a */
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    }
  }

  .back-row {
    margin-top: 0.5rem;
    text-align: left;
  }

  .back-link {
    display: inline-block;
    font-size: 0.8rem;
    color: #9bb1ff;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    padding-bottom: 2px;
    transition: color 0.15s, border-color 0.15s;

    &:hover {
      color: #ffffff;
      border-color: rgba(120, 150, 255, 0.7);
      text-shadow: 0 0 8px rgba(80, 120, 255, 0.9);
    }
  }

  @media (max-width: 480px) {
    .article-wrapper {
      padding: 1rem 1rem 3rem;
      gap: 1rem;
    }

    .article-cover {
      height: 180px;
    }

    .article-title {
      font-size: 1.15rem;
    }

    .author-side .author-name {
      font-size: 0.8rem;
    }

    .time-side {
      font-size: 0.7rem;
    }

    .article-body .article-content {
      font-size: 0.85rem;
      line-height: 1.45;
    }

    .back-link {
      font-size: 0.75rem;
    }
  }
`;
