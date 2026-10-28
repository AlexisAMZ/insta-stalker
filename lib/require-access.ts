import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, verifyToken } from "./access";

/** Défense en profondeur : les API privées revérifient le jeton, même si le middleware était contourné. Renvoie une réponse 404 à retourner, ou null si l'accès est valide. */
export async function denyUnlessAccess(req: NextRequest): Promise<NextResponse | null> {
  if (await verifyToken(req.cookies.get(ACCESS_COOKIE)?.value)) return null;
  return NextResponse.json({ error: "Introuvable" }, { status: 404 });
}
