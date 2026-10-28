export const SITE_URL = process.env.SITE_URL ?? "https://unfollowd.com";
export const SITE_NAME = "unfollowd by AMZ";

// Interrupteur de lancement : tant qu'il n'est pas à « 1 », le site reste privé et non indexé.
export const isLaunched = (env: Record<string, string | undefined> = process.env) => env.SITE_LAUNCHED === "1";

// Toujours publiques : la page d'attente, l'API d'inscription, robots et sitemap. Rien d'autre.
const ALWAYS_PUBLIC = new Set(["/bientot", "/api/waitlist", "/api/waitlist/confirm", "/robots.txt", "/sitemap.xml"]);
const PUBLIC_AFTER_LAUNCH = new Set(["/", "/legal"]);

/** Pages ouvertes au public. Avant le lancement : uniquement la page d'attente. */
export function isPublicPath(pathname: string, launched: boolean): boolean {
  if (ALWAYS_PUBLIC.has(pathname)) return true;
  return launched && PUBLIC_AFTER_LAUNCH.has(pathname);
}

/** Avant le lancement, toute page demandée par un visiteur sans accès affiche la page d'attente. */
export function teaserFor(pathname: string, launched: boolean): string | null {
  if (launched || pathname.startsWith("/api/")) return null;
  return "/bientot";
}

export const NOINDEX = { index: false, follow: false } as const;
