import "server-only";
import { hasKv, kvPipeline } from "./kv";

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

/** Limite partagée entre toutes les instances (Redis) ; retombe sur la mémoire si le store est indisponible. */
export async function allowShared(key: string, max: number, windowMs: number): Promise<boolean> {
  if (hasKv()) {
    try {
      const [count] = await kvPipeline([
        ["INCR", `rl:${key}`],
        ["PEXPIRE", `rl:${key}`, windowMs, "NX"],
      ]);
      return Number(count) <= max;
    } catch {
      /* store indisponible : on retombe sur la limite locale */
    }
  }
  return allow(key, max, windowMs);
}

export function clientIp(headers: Headers): string {
  return headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}
