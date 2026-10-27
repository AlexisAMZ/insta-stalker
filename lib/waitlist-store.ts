import "server-only";
import { hasDb, sql } from "./db";

export const hasWaitlistStore = hasDb;

/** Ajoute l'e-mail (une seule fois). Renvoie « exists » s'il était déjà inscrit. */
export async function addToWaitlist(email: string, source: string): Promise<"added" | "exists"> {
  const rows = await sql()`
    INSERT INTO waitlist (email, source) VALUES (${email}, ${source})
    ON CONFLICT (email) DO NOTHING
    RETURNING email`;
  return rows.length > 0 ? "added" : "exists";
}
