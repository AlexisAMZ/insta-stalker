import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, ACCESS_PASSWORD, accessToken } from "@/lib/access";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/acces")) return NextResponse.next();

  const cookie = req.cookies.get(ACCESS_COOKIE)?.value;
  if (cookie && cookie === (await accessToken(ACCESS_PASSWORD))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/acces";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/|favicon.ico).*)"] };
