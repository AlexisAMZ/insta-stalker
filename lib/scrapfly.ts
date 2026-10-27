import "server-only";

const IG_APP_ID = "936619743392459";

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly code: "not_configured" | "not_found" | "blocked" | "upstream",
    readonly status: number,
  ) {
    super(message);
  }
}

export const hasScrapfly = () => Boolean(process.env.SCRAPFLY_KEY);
export const hasIgSession = () => Boolean(process.env.IG_SESSIONID);

/** GET JSON d'Instagram, relayé par Scrapfly (anti-blocage). `session` : cookie sessionid d'un compte Instagram. */
export async function igJson(url: string, opts: { session?: boolean } = {}): Promise<unknown> {
  const key = process.env.SCRAPFLY_KEY;
  if (!key) throw new UpstreamError("Clé Scrapfly absente", "not_configured", 503);

  const params = new URLSearchParams({ key, url, asp: "true", country: "us" });
  params.set("headers[x-ig-app-id]", IG_APP_ID);
  params.set("headers[accept]", "application/json");
  if (opts.session) {
    const sid = process.env.IG_SESSIONID;
    if (!sid) throw new UpstreamError("Session Instagram absente", "not_configured", 503);
    params.set("headers[cookie]", `sessionid=${sid}`);
  }

  let res: Response;
  try {
    res = await fetch(`https://api.scrapfly.io/scrape?${params}`, { cache: "no-store", signal: AbortSignal.timeout(45_000) });
  } catch {
    throw new UpstreamError("Scrapfly injoignable", "upstream", 502);
  }
  if (!res.ok) throw new UpstreamError(`Scrapfly ${res.status}`, res.status === 429 ? "blocked" : "upstream", 502);

  const body = (await res.json().catch(() => null)) as { result?: { status_code?: number; content?: string } } | null;
  const status = body?.result?.status_code;
  if (status === 404) throw new UpstreamError("Compte introuvable", "not_found", 404);
  if (!status || status >= 400) throw new UpstreamError(`Instagram ${status ?? "?"}`, status === 429 || status === 401 || status === 403 ? "blocked" : "upstream", 502);

  try {
    return JSON.parse(body?.result?.content ?? "null");
  } catch {
    throw new UpstreamError("Réponse illisible", "upstream", 502);
  }
}

export const profileUrl = (handle: string) =>
  `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`;

export const storiesUrl = (userId: string) =>
  `https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${encodeURIComponent(userId)}`;
