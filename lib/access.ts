export const ACCESS_COOKIE = "amz_access";
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 7;

type Env = Record<string, string | undefined>;

/** Mot de passe d'accès. En production, il DOIT venir de AMZ_PASSWORD : sans lui, l'accès reste fermé. */
export function configuredPassword(env: Env = process.env): string | null {
  if (env.AMZ_PASSWORD) return env.AMZ_PASSWORD;
  return env.NODE_ENV === "production" ? null : "dev-password";
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

export const MIN_SECRET_LENGTH = 32;
const DEV_SECRET = "dev-secret-dev-secret-dev-secret-0";

/** Secret de signature. En production, AMZ_SECRET est OBLIGATOIRE (≥ 32 caractères) et distinct du mot de passe : sinon l'accès reste fermé. */
export function configuredSecret(env: Env = process.env): string | null {
  const secret = env.AMZ_SECRET;
  if (secret) return secret.length >= MIN_SECRET_LENGTH && secret !== env.AMZ_PASSWORD ? secret : null;
  return env.NODE_ENV === "production" ? null : DEV_SECRET;
}

export async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

/** Jeton de session « exp.nonce.signature » : l'expiration est signée et vérifiée côté serveur. */
export async function issueToken(env: Env = process.env, now = Date.now(), ttlMs = ACCESS_MAX_AGE * 1000): Promise<string | null> {
  const secret = configuredSecret(env);
  if (!secret || !configuredPassword(env)) return null;
  const exp = now + ttlMs;
  const nonce = crypto.randomUUID();
  return `${exp}.${nonce}.${await hmac(secret, `access:v3:${exp}.${nonce}`)}`;
}

export async function verifyToken(token: string | undefined | null, env: Env = process.env, now = Date.now()): Promise<boolean> {
  const secret = configuredSecret(env);
  if (!token || !secret || !configuredPassword(env)) return false;
  const [exp, nonce, sig, extra] = token.split(".");
  if (!exp || !nonce || !sig || extra !== undefined || !/^\d{1,15}$/.test(exp) || Number(exp) < now) return false;
  return timingSafeEqual(sig, await hmac(secret, `access:v3:${exp}.${nonce}`));
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
