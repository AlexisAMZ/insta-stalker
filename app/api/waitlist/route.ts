import { NextResponse, type NextRequest } from "next/server";
import { allowShared, clientIp } from "@/lib/ratelimit";
import { cleanSource, isValidEmail, normalizeEmail } from "@/lib/waitlist";
import { hasMailer, sendMail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/site";
import { addToWaitlist, hasWaitlistStore, isConfirmed } from "@/lib/waitlist-store";
import { confirmToken } from "@/lib/waitlist-token";

const reply = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status });

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const ok = (await allowShared(`waitlist:${ip}`, 5, 10 * 60_000)) && (await allowShared("waitlist:global", 2000, 24 * 3_600_000));
  if (!ok) return reply({ error: "Trop d'essais. Réessaie dans quelques minutes." }, 429);

  if (Number(req.headers.get("content-length") ?? 0) > 2048) return reply({ error: "Requête trop grosse." }, 413);
  const text = (await req.text().catch(() => "")).slice(0, 2048);
  let body: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = JSON.parse(text);
    body = typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    body = null;
  }
  if (!body) return reply({ error: "Requête invalide." }, 400);

  // Piège à robots : ce champ est caché, un humain ne le remplit jamais. On répond « ok » sans rien enregistrer.
  if (typeof body.website === "string" && body.website.length > 0) return reply({ ok: true });

  const email = typeof body.email === "string" ? body.email : "";
  if (!isValidEmail(email)) return reply({ error: "Cette adresse e-mail ne semble pas valide." }, 400);
  if (body.consent !== true) return reply({ error: "Coche la case pour accepter de recevoir l'e-mail de lancement." }, 400);

  if (!hasWaitlistStore() || !hasMailer()) return reply({ error: "Les inscriptions ne sont pas encore ouvertes." }, 503);

  try {
    // Même réponse que l'adresse soit nouvelle ou déjà inscrite : on ne révèle pas qui est sur la liste.
    const address = normalizeEmail(email);
    await addToWaitlist(address, cleanSource(body.source));
    // Double opt-in : rien n'est compté ni exporté tant que le propriétaire de l'adresse n'a pas cliqué.
    // Un seul e-mail de confirmation par adresse et par jour, pour ne pas servir à harceler un tiers.
    if (!(await isConfirmed(address)) && (await allowShared(`waitlist-mail:${address}`, 1, 24 * 3_600_000))) {
      const token = await confirmToken(address);
      if (!token) throw new Error("secret_missing");
      const link = `${SITE_URL}/api/waitlist/confirm?email=${encodeURIComponent(address)}&token=${encodeURIComponent(token)}`;
      await sendMail(address, "Confirme ton inscription à unfollowd", `Pour confirmer ton inscription et recevoir l'e-mail de lancement, ouvre ce lien (valable 3 jours) :\n\n${link}\n\nSi tu n'es pas à l'origine de cette demande, ignore ce message : rien ne sera enregistré à ton nom.`);
    }
    return reply({ ok: true });
  } catch (e) {
    console.error("[waitlist]", e instanceof Error ? e.message : e);
    return reply({ error: "Impossible d'enregistrer ton adresse pour le moment. Réessaie plus tard." }, 502);
  }
}
