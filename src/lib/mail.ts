import nodemailer from "nodemailer";

export function emailIsConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function transporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) throw new Error("Email delivery is not configured.");
  return nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } });
}

export async function sendActionEmail(to: string, subject: string, link: string) {
  await transporter().sendMail({
    from: process.env.MAIL_FROM ?? "JIT COFFIE <hello@jitcoffie.com>", to, subject,
    text: `Use this secure link within 30 minutes: ${link}\n\nIf you did not request this, you can ignore this email.`,
    html: `<main style="font-family:Arial,sans-serif;color:#25150f"><h1 style="color:#b87942">JIT COFFIE</h1><p>Use this secure link within 30 minutes.</p><p><a href="${link}" style="display:inline-block;padding:14px 22px;background:#b87942;color:white;text-decoration:none;border-radius:8px">${subject}</a></p><p>If you did not request this, you can ignore this email.</p></main>`,
  });
}
