import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, expectedToken, timingSafeEqual } from "@/lib/access";
import { isLaunched, isPublicPath, teaserFor } from "@/lib/site";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/acces") || isPublicPath(pathname, isLaunched())) return NextResponse.next();

  const cookie = req.cookies.get(ACCESS_COOKIE)?.value;
  const expected = await expectedToken();
  if (expected && cookie && timingSafeEqual(cookie, expected)) return NextResponse.next();

  const teaser = teaserFor(pathname, isLaunched());
  if (teaser) return NextResponse.rewrite(new URL(teaser, req.url));

  const url = req.nextUrl.clone();
  url.pathname = "/acces";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/|icon|apple-icon|opengraph-image|manifest.webmanifest|favicon.ico|robots.txt|sitemap.xml).*)"] };
