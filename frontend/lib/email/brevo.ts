// Envío de correo transaccional con la API HTTP de Brevo (Railway Hobby bloquea
// SMTP saliente). Sin SDK: un POST a /v3/smtp/email.
import "server-only";

export type Recipient = { email: string; name?: string };

export type EmailContent = { subject: string; html: string; text: string };

export type EmailMessage = EmailContent & {
  to: Recipient[];
  replyTo?: Recipient;
};

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Envía un correo. Devuelve true si Brevo lo aceptó. Sin BREVO_API_KEY o
 * MAIL_FROM_EMAIL (desarrollo) lo imprime en consola y devuelve false.
 * Nunca lanza: un fallo de correo no debe romper la operación que lo origina.
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.MAIL_FROM_EMAIL;
  const recipients = message.to.filter((r) => r.email);
  if (recipients.length === 0) return false;

  if (!apiKey || !senderEmail) {
    console.info(
      `[email:consola] Para: ${recipients.map((r) => r.email).join(", ")}\n` +
        `Asunto: ${message.subject}\n\n${message.text}\n`,
    );
    return false;
  }

  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: process.env.MAIL_FROM_NAME || "Puesta del Sol" },
        to: recipients,
        replyTo: message.replyTo,
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[email] Brevo respondió ${res.status}: ${await res.text().catch(() => "")}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Error enviando con Brevo:", err);
    return false;
  }
}
