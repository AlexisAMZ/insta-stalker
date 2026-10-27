import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";
import Dashboard from "./Dashboard";

export const metadata: Metadata = { title: "Tableau de bord", description: "Ton tableau de bord : captures, unfollow et historique.", robots: NOINDEX };

export default async function Page({ searchParams }: { searchParams: Promise<{ etat?: string }> }) {
  const { etat } = await searchParams;
  return <Dashboard initialEmpty={etat === "vide"} />;
}
