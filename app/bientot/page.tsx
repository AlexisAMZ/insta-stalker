import type { Metadata } from "next";
import Teaser from "@/components/teaser/Teaser";
import { safeNext } from "@/lib/access";

export const metadata: Metadata = {
  title: "Sois prévenu du lancement",
  description: "unfollowd te dit qui t'a unfollow, qui ne te suit pas en retour et qui te ment. Laisse ton e-mail, on te prévient le jour du lancement.",
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <Teaser next={safeNext(next)} />;
}
