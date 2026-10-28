import { configuredSecret, hmac, timingSafeEqual } from "./access.ts";

type Env = Record<string, string | undefined>;
export const CONFIRM_TTL_MS = 3 * 24 * 3_600_000;

/** Jeton de confirmation « exp.signature », lié à l'adresse : impossible à fabriquer ou à réutiliser pour une autre adresse. */
export async function confirmToken(email: string, env: Env = process.env, now = Date.now()): Promise<string | null> {
  const secret = configuredSecret(env);
  if (!secret) return null;
  const exp = now + CONFIRM_TTL_MS;
  return `${exp}.${await hmac(secret, `waitlist:confirm:${email}:${exp}`)}`;
}

export async function verifyConfirmToken(email: string, token: string, env: Env = process.env, now = Date.now()): Promise<boolean> {
  const secret = configuredSecret(env);
  const [exp, sig, extra] = token.split(".");
  if (!secret || !exp || !sig || extra !== undefined || !/^\d{1,15}$/.test(exp) || Number(exp) < now) return false;
  return timingSafeEqual(sig, await hmac(secret, `waitlist:confirm:${email}:${exp}`));
}
