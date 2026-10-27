import { NextResponse, type NextRequest } from "next/server";
import { isAllowedMediaUrl } from "@/lib/instagram";
import { allow } from "@/lib/ratelimit";

const MAX_BYTES = 60 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("u") ?? "";
  if (!isAllowedMediaUrl(target)) return NextResponse.json({ error: "Média non autorisé" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!allow(`media:${ip}`, 200, 10 * 60_000)) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

  let upstream: Response;
  try {
    upstream = await fetch(target, { signal: AbortSignal.timeout(30_000), redirect: "error" });
  } catch {
    return NextResponse.json({ error: "Média indisponible" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) return NextResponse.json({ error: "Média expiré ou indisponible" }, { status: 502 });

  const type = upstream.headers.get("content-type") ?? "";
  if (!/^(image|video)\//.test(type)) return NextResponse.json({ error: "Type inattendu" }, { status: 502 });
  if (Number(upstream.headers.get("content-length") ?? 0) > MAX_BYTES) return NextResponse.json({ error: "Fichier trop gros" }, { status: 413 });

  const headers = new Headers({ "content-type": type, "cache-control": "private, max-age=600", "x-content-type-options": "nosniff" });
  const filename = req.nextUrl.searchParams.get("dl");
  if (filename) headers.set("content-disposition", `attachment; filename="${filename.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80)}"`);
  return new NextResponse(upstream.body, { headers });
}
