import { NextResponse, type NextRequest } from "next/server";
import { allowShared, clientIp } from "@/lib/ratelimit";
import { cleanSource, isValidEmail, normalizeEmail } from "@/lib/waitlist";
import { addToWaitlist, hasWaitlistStore } from "@/lib/waitlist-store";

const reply = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status });

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const ok = (await allowShared(`waitlist:${ip}`, 5, 10 * 60_000)) && (await allowShared("waitlist:global", 400, 24 * 3_600_000));
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

  if (!hasWaitlistStore()) return reply({ error: "Les inscriptions ne sont pas encore ouvertes." }, 503);

  try {
    // Même réponse que l'adresse soit nouvelle ou déjà inscrite : on ne révèle pas qui est sur la liste.
    await addToWaitlist(normalizeEmail(email), cleanSource(body.source));
    return reply({ ok: true });
  } catch (e) {
    console.error("[waitlist]", e instanceof Error ? e.message : e);
    return reply({ error: "Impossible d'enregistrer ton adresse pour le moment. Réessaie plus tard." }, 502);
  }
}
