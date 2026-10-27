"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, ACCESS_PASSWORD, accessToken, safeNext } from "@/lib/access";

export type AccessState = { error?: string };

export async function unlock(_prev: AccessState, form: FormData): Promise<AccessState> {
  const password = String(form.get("password") ?? "");
  if (password !== ACCESS_PASSWORD) return { error: "Mot de passe incorrect." };

  (await cookies()).set(ACCESS_COOKIE, await accessToken(ACCESS_PASSWORD), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(safeNext(String(form.get("next") ?? "")));
}
