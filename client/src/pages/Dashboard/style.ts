// src/pages/DashboardPage/style.ts
import styled from "styled-components";

export const DashboardPageContainer = styled.main`
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

  .dashboard-wrapper {
    max-width: 1200px;
    width: 100%;
    margin: 2rem auto 4rem;
    padding: 0 1.25rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ---------------- STATUS BANNERS ---------------- */

  .status {
    font-size: 0.8rem;
    line-height: 1.4;
    border-radius: 0.6rem;
    padding: 0.8rem 1rem;
    font-weight: 500;
    text-align: left;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9);

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
      background: rgba(8, 10, 20, 0.4);
      border: 1px solid rgba(160, 160, 220, 0.2);
      color: #9da8d8;
    }
  }

  .action-feedback {
    background: rgba(0, 180, 120, 0.12);
    border: 1px solid rgba(0, 180, 120, 0.4);
    color: #4be0a5;
    font-size: 0.8rem;
    line-height: 1.4;
    font-weight: 500;
    border-radius: 0.6rem;
    padding: 0.8rem 1rem;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9);
  }

  /* ---------------- SESSION CARD (IDENTITÉ USER) ---------------- */

  .session-card {
    background: rgba(30, 40, 70, 0.6);
    border: 1px solid rgba(80, 120, 255, 0.25);
    border-radius: 1rem;
    box-shadow: 0 35px 80px rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);
    padding: 1rem 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .session-header {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .session-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }

  .session-role {
    font-size: 0.8rem;
    color: #9da8d8;

    .name {
      color: #fff;
      font-weight: 500;
      margin-right: 0.4rem;
    }
  }

  .role-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.2;
    padding: 0.25rem 0.5rem;
    border-radius: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    &.user {
      background: rgba(80, 120, 255, 0.15);
      border: 1px solid rgba(80, 120, 255, 0.4);
      color: #9bb1ff;
    }
    &.admin {
      background: rgba(255, 0, 76, 0.12);
      border: 1px solid rgba(255, 0, 76, 0.4);
      color: #ff6b6b;
    }
  }

  .session-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #cfd8ff;

    strong {
      color: #fff;
      font-weight: 500;
    }
  }

  /* ---------------- PANEL CARD (TABLES) ---------------- */

  .panel-card {
    background: rgba(30, 40, 70, 0.6);
    border: 1px solid rgba(80, 120, 255, 0.25);
    border-radius: 1rem;
    box-shadow: 0 35px 80px rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);

    padding: 1rem 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.75rem;
    justify-content: space-between;
  }

  .panel-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }

  .panel-new-btn {
    background: radial-gradient(
      circle at 20% 20%,
      rgba(80, 120, 255, 0.9) 0%,
      rgba(40, 60, 140, 0.8) 60%
    );
    border: 1px solid rgba(120, 150, 255, 0.5);
    border-radius: 0.6rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #fff;
    line-height: 1.2;
    cursor: pointer;
    box-shadow: 0 20px 40px rgba(30, 40, 100, 0.8),
      0 2px 4px rgba(0, 0, 0, 0.8);
    transition: box-shadow 0.15s, filter 0.15s;

    &:hover {
      box-shadow: 0 24px 60px rgba(50, 80, 200, 0.9),
        0 4px 8px rgba(0, 0, 0, 0.9);
      filter: brightness(1.06);
    }
  }

  /* ---------------- TABLE ---------------- */

  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    min-width: 600px;
    border-collapse: collapse;
    font-size: 0.8rem;
    color: #cfd8ff;
  }

  .data-table thead tr {
    background: rgba(8, 10, 20, 0.5);
  }

  .data-table th {
    text-align: left;
    font-weight: 600;
    padding: 0.6rem 0.75rem;
    color: #ffffff;
    border-bottom: 1px solid rgba(120, 150, 255, 0.4);
    white-space: nowrap;

    &.th-actions {
      text-align: right;
    }
  }

  .data-table td {
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid rgba(80, 120, 255, 0.15);
    vertical-align: top;
  }

  .col-id {
    color: #6571a8;
    font-weight: 500;
    white-space: nowrap;
  }

  .col-title {
    color: #fff;
    font-weight: 500;
    line-height: 1.4;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  }

  .col-user .usr-ident {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
  }

  .usr-name {
    color: #fff;
    font-weight: 500;
  }

  .usr-email {
    color: #9da8d8;
    font-size: 0.7rem;
    word-break: break-all;
  }

  .col-role .role-badge {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.2;
    padding: 0.25rem 0.4rem;
    border-radius: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    &.user {
      background: rgba(80, 120, 255, 0.15);
      border: 1px solid rgba(80, 120, 255, 0.4);
      color: #9bb1ff;
    }
    &.admin {
      background: rgba(255, 0, 76, 0.12);
      border: 1px solid rgba(255, 0, 76, 0.4);
      color: #ff6b6b;
    }
  }

  .col-date {
    color: #9da8d8;
    font-size: 0.7rem;
    line-height: 1.4;
    white-space: nowrap;
  }

  .col-actions {
    text-align: right;
    white-space: nowrap;
  }

  /* ---------------- ACTION BUTTONS PAR LIGNE ---------------- */

  .mini-btn {
    cursor: pointer;
    font-size: 0.7rem;
    font-weight: 500;
    line-height: 1.2;
    padding: 0.4rem 0.6rem;
    border-radius: 0.4rem;
    border: 1px solid transparent;
    background: rgba(8, 10, 20, 0.4);
    color: #cfd8ff;
    transition: box-shadow 0.15s, filter 0.15s;
    margin-left: 0.5rem;
  }

  .mini-btn.edit {
    border-color: rgba(120, 150, 255, 0.5);
    box-shadow: 0 10px 20px rgba(30, 40, 100, 0.8),
      0 1px 2px rgba(0,0,0,0.8);
  }

  .mini-btn.edit:hover {
    filter: brightness(1.1);
    box-shadow: 0 14px 24px rgba(50,80,200,0.9),
      0 2px 4px rgba(0,0,0,0.9);
  }

  .mini-btn.delete {
    border-color: rgba(255, 0, 76, 0.5);
    color: #ff6b6b;
    box-shadow: 0 10px 20px rgba(80,0,0,0.6),
      0 1px 2px rgba(0,0,0,0.8);
  }

  .mini-btn.delete:hover {
    filter: brightness(1.05);
    box-shadow: 0 14px 24px rgba(150,0,40,0.8),
      0 2px 4px rgba(0,0,0,0.9);
  }

  @media (max-width: 550px) {
    .session-title {
      font-size: 1rem;
    }

    .session-role {
      font-size: 0.75rem;
    }

    .session-meta {
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.7rem;
    }

    .panel-head {
      flex-direction: column;
      align-items: stretch;
      .panel-new-btn {
        width: 100%;
        text-align: center;
      }
    }

    .data-table {
      font-size: 0.7rem;
      min-width: 500px;
    }

    .col-actions .mini-btn {
      margin-left: 0.4rem;
    }
  }
`;
