"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, ACCESS_MAX_AGE, configuredPassword, expectedToken, passwordMatches, safeNext } from "@/lib/access";
import { allowShared, clientIp } from "@/lib/ratelimit";

export type AccessState = { error?: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function unlock(_prev: AccessState, form: FormData): Promise<AccessState> {
  const ip = clientIp(await headers());
  // Anti force brute : par adresse, puis plafond global contre les essais répartis sur beaucoup d'adresses.
  const ok = (await allowShared(`login:${ip}`, 8, 15 * 60_000)) && (await allowShared("login:global", 300, 60 * 60_000));
  if (!ok) return { error: "Trop d'essais. Réessaie plus tard." };

  if (!configuredPassword()) return { error: "L'accès n'est pas encore configuré." };

  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!(await passwordMatches(password))) {
    await sleep(700);
    return { error: "Mot de passe incorrect." };
  }

  const token = await expectedToken();
  if (!token) return { error: "L'accès n'est pas encore configuré." };
  (await cookies()).set(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  redirect(safeNext(String(form.get("next") ?? "")));
}
