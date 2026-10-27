import "server-only";
import { hasKv, kv } from "./kv";

export const hasWaitlistStore = hasKv;

/** Ajoute l'e-mail (une seule fois). Renvoie « exists » s'il était déjà inscrit. */
export async function addToWaitlist(email: string, source: string): Promise<"added" | "exists"> {
  const result = await kv(["HSETNX", "waitlist", email, JSON.stringify({ at: new Date().toISOString(), source })]);
  return result === 1 ? "added" : "exists";
}
