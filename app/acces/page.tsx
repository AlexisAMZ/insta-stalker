import type { Metadata } from "next";
import Teaser from "@/components/teaser/Teaser";
import { NOINDEX } from "@/lib/site";

export const metadata: Metadata = { title: "Accès admin", description: "Accès privé à unfollowd.", robots: NOINDEX };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <Teaser adminOpen next={next ?? "/"} />;
}
