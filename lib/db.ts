import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Base Neon (Postgres), reliée au projet par l'intégration Vercel : DATABASE_URL.
export const hasDb = () => Boolean(process.env.DATABASE_URL);

let client: NeonQueryFunction<false, false> | null = null;

export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("db_not_configured");
  client ??= neon(url);
  return client;
}
