import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";
import Compare from "./Compare";

export const metadata: Metadata = { title: "Comparaison", description: "Compare deux captures : qui t'a unfollow, qui ne te suit pas en retour.", robots: NOINDEX };

export default function Page() {
  return <Compare />;
}
