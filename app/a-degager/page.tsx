import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";
import CutList from "./CutList";

export const metadata: Metadata = { title: "À dégager", description: "Ta liste de personnes à dégager.", robots: NOINDEX };

export default function Page() {
  return <CutList />;
}
