import { getResend } from "@/lib/resend";

export async function sendPasswordResetEmail(to: string, token: string) {
  const resend = getResend();
  const from = process.env.RESEND_FROM;
  const appUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!resend || !from || !appUrl) {
    return;
  }

  const url = `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from,
    to,
    subject: "Reset your Barkley Bites password",
    html: `<p style="font-family:system-ui">We received a request to reset your password.</p>
      <p style="font-family:system-ui"><a href="${url}">Click here to choose a new password</a>. This link expires in one hour.</p>`,
  });
}
