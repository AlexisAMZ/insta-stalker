import "server-only";
import { hasDb, sql } from "./db";
import { parseOffset, visibleCount } from "./waitlist";

export const hasWaitlistStore = hasDb;

/** Ajoute l'e-mail (une seule fois). Renvoie « exists » s'il était déjà inscrit. */
export async function addToWaitlist(email: string, source: string): Promise<"added" | "exists"> {
  const rows = await sql()`
    INSERT INTO waitlist (email, source) VALUES (${email}, ${source})
    ON CONFLICT (email) DO NOTHING
    RETURNING email`;
  return rows.length > 0 ? "added" : "exists";
}

/** Confirme l'adresse (idempotent). Renvoie false si elle n'est pas dans la liste. */
export async function confirmWaitlist(email: string): Promise<boolean> {
  const rows = await sql()`
    UPDATE waitlist SET confirmed_at = COALESCE(confirmed_at, now()) WHERE email = ${email} RETURNING email`;
  return rows.length > 0;
}

export async function isConfirmed(email: string): Promise<boolean> {
  const rows = await sql()`SELECT 1 FROM waitlist WHERE email = ${email} AND confirmed_at IS NOT NULL`;
  return rows.length > 0;
}

let cached: { at: number; value: number | null } | null = null;

/** Nombre d'inscrits à montrer sur la page d'attente (mis en cache 60 s), ou null. Seules les adresses confirmées comptent ; les e-mails de test sont exclus. */
export async function publicWaitlistCount(): Promise<number | null> {
  if (cached && Date.now() - cached.at < 60_000) return cached.value;
  const offset = parseOffset(process.env.WAITLIST_OFFSET);
  let inDb = 0;
  if (hasDb()) {
    try {
      const rows = await sql()`SELECT count(*)::int AS n FROM waitlist WHERE source <> 'test' AND confirmed_at IS NOT NULL`;
      inDb = Number(rows[0]?.n ?? 0);
    } catch {
      /* base indisponible : on ne montre que le décalage */
    }
  }
  cached = { at: Date.now(), value: visibleCount(inDb, offset) };
  return cached.value;
}
