export const ACCESS_COOKIE = "amz_access";
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 7;

type Env = Record<string, string | undefined>;

/** Mot de passe d'accès. En production, il DOIT venir de AMZ_PASSWORD : sans lui, l'accès reste fermé. */
export function configuredPassword(env: Env = process.env): string | null {
  if (env.AMZ_PASSWORD) return env.AMZ_PASSWORD;
  return env.NODE_ENV === "production" ? null : "dev-password";
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

/** Valeur du cookie d'accès : signature HMAC, impossible à déduire du mot de passe sans le secret. */
export async function expectedToken(env: Env = process.env): Promise<string | null> {
  const password = configuredPassword(env);
  if (!password) return null;
  return hmac(env.AMZ_SECRET ?? password, "unfollowd:access:v2");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function passwordMatches(input: string, env: Env = process.env): Promise<boolean> {
  const password = configuredPassword(env);
  if (!password) return false;
  const [a, b] = await Promise.all([hmac("cmp", input), hmac("cmp", password)]);
  return timingSafeEqual(a, b);
}

/** Redirection après connexion : uniquement un chemin interne (pas de //, de \ ni de caractère de contrôle). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(next)) return "/";
  try {
    return new URL(next, "http://x.invalid").origin === "http://x.invalid" ? next : "/";
  } catch {
    return "/";
  }
}
