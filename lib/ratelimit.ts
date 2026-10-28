import "server-only";
import { hasDb, sql } from "./db";

// Repli en mémoire (par instance serverless) quand le store partagé n'est pas disponible.
const hits = new Map<string, number[]>();

export function allow(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  hits.set(key, [...recent, now]);
  if (hits.size > 5000) hits.clear();
  return true;
}

/** Limite partagée entre toutes les instances (Postgres) ; retombe sur la mémoire si la base est indisponible. */
export async function allowShared(key: string, max: number, windowMs: number, opts: { failClosed?: boolean } = {}): Promise<boolean> {
  if (hasDb()) {
    try {
      const rows = await sql()`
        INSERT INTO rate_limits (key, count, reset_at)
        VALUES (${key}, 1, now() + make_interval(secs => ${windowMs / 1000}))
        ON CONFLICT (key) DO UPDATE SET
          count = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
          reset_at = CASE WHEN rate_limits.reset_at < now() THEN excluded.reset_at ELSE rate_limits.reset_at END
        RETURNING count`;
      // Ménage occasionnel des compteurs expirés.
      if (Math.random() < 0.01) void sql()`DELETE FROM rate_limits WHERE reset_at < now() - interval '1 day'`.catch(() => {});
      return Number(rows[0]?.count) <= max;
    } catch {
      /* base indisponible : refus si failClosed, sinon limite locale */
      if (opts.failClosed) return false;
    }
  }
  return allow(key, max, windowMs);
}

export function clientIp(headers: Headers): string {
  return headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}
