import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "noreply@hapgiveaway.com";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email",
    html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}

export async function sendWinnerEmail(email: string, giveawayTitle: string, prize: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `You won: ${giveawayTitle}!`,
    html: `<p>Congratulations! You've been selected as the winner of <strong>${giveawayTitle}</strong>.</p><p>Prize: ${prize}</p>`,
  });
}
