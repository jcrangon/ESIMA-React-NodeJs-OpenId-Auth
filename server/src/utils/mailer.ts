// src/utils/mailer.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.example.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  tls: { rejectUnauthorized: false },
  secure: false, // true si port 465
  auth: {
    user: process.env.SMTP_USER ?? "test@example.com",
    pass: process.env.SMTP_PASS ?? "password",
  },
});

/**
 * Envoie l'email de réinitialisation de mot de passe.
 * FRONTEND_RESET_URL = URL de ta page front /reset-password
 * ex: https://monfront.com/reset-password
 */
export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.FRONTEND_RESET_URL ?? "http://localhost:5173/auth/reset-password";
  const resetLink = `${baseUrl}?token=${encodeURIComponent(token)}`;

  const subject = "Réinitialisation de votre mot de passe";
  const text = [
    "Vous avez demandé à réinitialiser votre mot de passe.",
    "Cliquez sur le lien ci-dessous (valide 15 minutes) :",
    resetLink,
    "",
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
  ].join("\n");

  const html = `
    <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
    <p><a href="${resetLink}">Cliquez ici pour le réinitialiser</a> (valide 15 minutes)</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? '"Support" <support@example.com>',
    to,
    subject,
    text,
    html,
  });
}

/* =============================================================================
📘 RÉSUMÉ PÉDAGOGIQUE — utils/mailer.ts
===============================================================================

Rôle :
------
- Construire l'URL de reset: FRONTEND_RESET_URL + "?token=..."
- Envoyer un email contenant ce lien.

Pourquoi on met le token dans l'URL ?
-------------------------------------
Le front va lire le token dans `window.location.search`
et l'inclure dans le body de POST /auth/reset-password.
Le backend ne "lit" jamais le token depuis l'URL du front,
il le reçoit explicitement dans la requête.

Asynchrone :
------------
On n'a pas besoin d'attendre le mail pour répondre à l'utilisateur.
Dans le contrôleur, on peut faire:
  sendPasswordResetEmail(...).catch(console.error)
et répondre tout de suite 200. Ça améliore la perf perçue.

Sécurité :
----------
- Le token de reset expire vite (ex: 15 minutes).
- Le lien n'est utilisable qu'une seule fois.
============================================================================= */
