export const SITE_URL = process.env.SITE_URL ?? "https://unfollowd.com";
export const SITE_NAME = "unfollowd by AMZ";

// Interrupteur de lancement : tant qu'il n'est pas à « 1 », le site reste privé et non indexé.
export const isLaunched = (env: Record<string, string | undefined> = process.env) => env.SITE_LAUNCHED === "1";

// Toujours publiques : la page d'attente, les mentions (nécessaires pour la collecte d'e-mails) et l'API d'inscription.
const ALWAYS_PUBLIC = new Set(["/bientot", "/legal", "/api/waitlist", "/robots.txt", "/sitemap.xml"]);

/** Pages ouvertes au public. L'accueil ne l'est qu'une fois le site lancé ; l'app reste derrière le mot de passe. */
export function isPublicPath(pathname: string, launched: boolean): boolean {
  if (ALWAYS_PUBLIC.has(pathname)) return true;
  return launched && pathname === "/";
}

/** Avant le lancement, l'adresse principale montre la page d'attente aux visiteurs sans accès. */
export function teaserFor(pathname: string, launched: boolean): string | null {
  return !launched && pathname === "/" ? "/bientot" : null;
}

export const NOINDEX = { index: false, follow: false } as const;
