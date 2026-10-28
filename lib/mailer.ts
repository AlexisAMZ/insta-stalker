import "server-only";

export const hasMailer = () => Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

/** Envoi via l'API HTTP de Resend (aucune dépendance). Lève une erreur si l'envoi échoue. */
export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`mail_${res.status}`);
}
