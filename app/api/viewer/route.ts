import { NextResponse, type NextRequest } from "next/server";
import { isValidHandle, normalizeHandle, parseProfile, parseStories, type IgProfile, type IgStoryItem } from "@/lib/instagram";
import { allowShared, clientIp } from "@/lib/ratelimit";
import { hasIgSession, igJson, profileUrl, storiesUrl, UpstreamError } from "@/lib/scrapfly";

type StoriesStatus = "ok" | "none" | "private" | "unavailable";
type Payload = { profile: IgProfile; stories: IgStoryItem[]; storiesStatus: StoriesStatus };

const cache = new Map<string, { at: number; data: Payload }>();
const TTL_MS = 5 * 60_000;

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function GET(req: NextRequest) {
  const handle = normalizeHandle(req.nextUrl.searchParams.get("u") ?? "");
  if (!isValidHandle(handle)) return fail("Pseudo invalide. Exemple : @nom.utilisateur", 400);

  const hit = cache.get(handle.toLowerCase());
  if (hit && Date.now() - hit.at < TTL_MS) return NextResponse.json(hit.data);

  // Seules les recherches qui coûtent un appel Scrapfly sont comptées : par visiteur, puis plafond global par jour.
  const ip = clientIp(req.headers);
  if (!(await allowShared(`viewer:${ip}`, 15, 10 * 60_000))) return fail("Trop de recherches. Réessaie dans quelques minutes.", 429);
  if (!(await allowShared("viewer:global", 500, 24 * 3_600_000))) return fail("Le service est très demandé aujourd'hui. Réessaie demain.", 429);

  try {
    const profile = parseProfile(await igJson(profileUrl(handle)));
    if (!profile) return fail("Compte introuvable.", 404);

    let stories: IgStoryItem[] = [];
    let storiesStatus: StoriesStatus = "unavailable";
    if (profile.isPrivate) {
      storiesStatus = "private";
    } else if (profile.id && hasIgSession()) {
      stories = parseStories(await igJson(storiesUrl(profile.id), { session: true }).catch(() => null));
      storiesStatus = stories.length > 0 ? "ok" : "none";
    }

    const data: Payload = { profile, stories, storiesStatus };
    cache.set(handle.toLowerCase(), { at: Date.now(), data });
    if (cache.size > 500) cache.clear();
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof UpstreamError) {
      console.error("[viewer]", e.code, e.message);
      if (e.code === "not_configured") return fail("Le service n'est pas encore activé.", 503);
      if (e.code === "not_found") return fail("Compte introuvable.", 404);
      if (e.code === "blocked") return fail("Instagram limite les requêtes pour le moment. Réessaie plus tard.", 503);
    } else {
      console.error("[viewer] inattendu", e);
    }
    return fail("Impossible de récupérer ce compte pour l'instant.", 502);
  }
}
