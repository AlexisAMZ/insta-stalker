import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";
import Viewer from "./Viewer";

export const metadata: Metadata = { title: "Stories et photo de profil", description: "Regarde les stories et la photo de profil d'un compte public.", robots: NOINDEX };

export default function Page() {
  return <Viewer />;
}
