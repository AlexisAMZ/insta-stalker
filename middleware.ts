import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, verifyToken } from "@/lib/access";
import { isLaunched, isPublicPath, teaserFor } from "@/lib/site";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/acces") || isPublicPath(pathname, isLaunched())) return NextResponse.next();

  if (await verifyToken(req.cookies.get(ACCESS_COOKIE)?.value)) return NextResponse.next();

  // Visiteur sans accès : les API privées n'existent pas, toute page affiche la page d'attente (même adresse).
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const teaser = teaserFor(pathname, isLaunched());
  if (teaser) {
    const url = new URL(teaser, req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.rewrite(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = "/acces";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/|icon|apple-icon|opengraph-image|manifest.webmanifest|favicon.ico|robots.txt|sitemap.xml).*)"] };
