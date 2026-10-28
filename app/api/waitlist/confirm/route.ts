import { NextResponse, type NextRequest } from "next/server";
import { allowShared, clientIp } from "@/lib/ratelimit";
import { SITE_URL } from "@/lib/site";
import { isValidEmail, normalizeEmail } from "@/lib/waitlist";
import { confirmWaitlist, hasWaitlistStore } from "@/lib/waitlist-store";
import { verifyConfirmToken } from "@/lib/waitlist-token";

const back = (status: "ok" | "invalide") => NextResponse.redirect(new URL(`/bientot?confirmation=${status}`, SITE_URL));

export async function GET(req: NextRequest) {
  if (!(await allowShared(`waitlist-confirm:${clientIp(req.headers)}`, 20, 10 * 60_000))) return back("invalide");
  const email = normalizeEmail(req.nextUrl.searchParams.get("email") ?? "");
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!isValidEmail(email) || !(await verifyConfirmToken(email, token)) || !hasWaitlistStore()) return back("invalide");
  try {
    return back((await confirmWaitlist(email)) ? "ok" : "invalide");
  } catch (e) {
    console.error("[waitlist-confirm]", e instanceof Error ? e.message : e);
    return back("invalide");
  }
}
