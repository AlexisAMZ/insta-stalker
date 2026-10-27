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

let cached: { at: number; value: number | null } | null = null;

/** Nombre d'inscrits à montrer sur la page d'attente (mis en cache 60 s), ou null. Les e-mails de test sont exclus. */
export async function publicWaitlistCount(): Promise<number | null> {
  if (cached && Date.now() - cached.at < 60_000) return cached.value;
  const offset = parseOffset(process.env.WAITLIST_OFFSET);
  let inDb = 0;
  if (hasDb()) {
    try {
      const rows = await sql()`SELECT count(*)::int AS n FROM waitlist WHERE source <> 'test'`;
      inDb = Number(rows[0]?.n ?? 0);
    } catch {
      /* base indisponible : on ne montre que le décalage */
    }
  }
  cached = { at: Date.now(), value: visibleCount(inDb, offset) };
  return cached.value;
}
