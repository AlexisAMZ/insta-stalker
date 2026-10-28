import { NextResponse, type NextRequest } from "next/server";
import { isAllowedMediaUrl } from "@/lib/instagram";
import { denyUnlessAccess } from "@/lib/require-access";
import { allowShared, clientIp } from "@/lib/ratelimit";

const MAX_BYTES = 60 * 1024 * 1024;
// Pas de SVG ni de HTML : seulement des images raster et de la vidéo.
const ALLOWED_TYPES = /^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime))(;|$)/i;

export async function GET(req: NextRequest) {
  const denied = await denyUnlessAccess(req);
  if (denied) return denied;

  const target = req.nextUrl.searchParams.get("u") ?? "";
  if (!isAllowedMediaUrl(target)) return NextResponse.json({ error: "Média non autorisé" }, { status: 400 });

  if (!(await allowShared(`media:${clientIp(req.headers)}`, 200, 10 * 60_000))) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

  let upstream: Response;
  try {
    upstream = await fetch(target, { signal: AbortSignal.timeout(30_000), redirect: "error" });
  } catch {
    return NextResponse.json({ error: "Média indisponible" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) return NextResponse.json({ error: "Média expiré ou indisponible" }, { status: 502 });

  const type = upstream.headers.get("content-type") ?? "";
  if (!ALLOWED_TYPES.test(type)) return NextResponse.json({ error: "Type inattendu" }, { status: 502 });
  if (Number(upstream.headers.get("content-length") ?? 0) > MAX_BYTES) return NextResponse.json({ error: "Fichier trop gros" }, { status: 413 });

  const headers = new Headers({ "content-type": type, "cache-control": "private, max-age=600", "x-content-type-options": "nosniff", "content-security-policy": "sandbox" });
  const filename = req.nextUrl.searchParams.get("dl");
  if (filename) headers.set("content-disposition", `attachment; filename="${filename.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80)}"`);
  // content-length peut manquer ou mentir : on coupe le flux au-delà du plafond.
  let sent = 0;
  const capped = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        sent += chunk.byteLength;
        if (sent > MAX_BYTES) controller.error(new Error("too_large"));
        else controller.enqueue(chunk);
      },
    }),
  );
  return new NextResponse(capped, { headers });
}
