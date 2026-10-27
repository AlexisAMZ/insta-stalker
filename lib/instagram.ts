// Parseurs purs (sans réseau) pour les réponses Instagram renvoyées via Scrapfly.

export type IgProfile = {
  id: string | null;
  username: string;
  fullName: string;
  bio: string;
  isPrivate: boolean;
  isVerified: boolean;
  picHd: string | null;
  followers: number | null;
  following: number | null;
  posts: number | null;
};

export type IgStoryItem = {
  id: string;
  kind: "image" | "video";
  url: string;
  poster: string | null;
  takenAt: number | null;
};

const HANDLE = /^[A-Za-z0-9._]{1,30}$/;

export function isValidHandle(handle: string): boolean {
  return HANDLE.test(handle) && !handle.startsWith(".") && !handle.endsWith(".") && !handle.includes("..");
}

export function normalizeHandle(raw: string): string {
  return raw.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "");
}

const ALLOWED_MEDIA_SUFFIXES = [".cdninstagram.com", ".fbcdn.net"];

export function isAllowedMediaUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && ALLOWED_MEDIA_SUFFIXES.some((s) => u.hostname.endsWith(s));
  } catch {
    return false;
  }
}

const obj = (v: unknown): Record<string, unknown> | null =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function parseProfile(json: unknown): IgProfile | null {
  const user = obj(obj(obj(json)?.data)?.user);
  if (!user) return null;
  const username = str(user.username);
  if (!username) return null;
  return {
    id: str(user.id),
    username,
    fullName: str(user.full_name) ?? "",
    bio: str(user.biography) ?? "",
    isPrivate: user.is_private === true,
    isVerified: user.is_verified === true,
    picHd: str(user.profile_pic_url_hd) ?? str(user.profile_pic_url),
    followers: num(obj(user.edge_followed_by)?.count),
    following: num(obj(user.edge_follow)?.count),
    posts: num(obj(user.edge_owner_to_timeline_media)?.count),
  };
}

function firstUrl(list: unknown): string | null {
  if (!Array.isArray(list)) return null;
  return str(obj(list[0])?.url);
}

export function parseStories(json: unknown): IgStoryItem[] {
  const root = obj(json);
  if (!root) return [];

  const reels: unknown[] = [];
  if (Array.isArray(root.reels_media)) reels.push(...root.reels_media);
  const byId = obj(root.reels);
  if (byId) reels.push(...Object.values(byId));

  const items: IgStoryItem[] = [];
  for (const reel of reels) {
    const list = obj(reel)?.items;
    if (!Array.isArray(list)) continue;
    for (const raw of list) {
      const it = obj(raw);
      if (!it) continue;
      const id = str(it.pk) ?? str(it.id) ?? (typeof it.pk === "number" ? String(it.pk) : null);
      const poster = firstUrl(obj(it.image_versions2)?.candidates);
      const video = firstUrl(it.video_versions);
      const url = video ?? poster;
      if (!id || !url) continue;
      items.push({ id, kind: video ? "video" : "image", url, poster, takenAt: num(it.taken_at) });
    }
  }
  return items;
}
