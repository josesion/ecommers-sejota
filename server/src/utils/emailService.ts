import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await resend.emails.send({
    from: "noreply@tudominio.com",
    to,
    subject,
    html,
  });
}
