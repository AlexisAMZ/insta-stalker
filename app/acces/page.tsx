import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";
import AccessForm from "./AccessForm";
import { BrandMarks } from "@/components/Logos";

export const metadata: Metadata = { title: "Accès", description: "Accès privé à unfollowd.", robots: NOINDEX };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="gate">
      <div className="gate-box">
        <p className="brand">unfollowd<span className="by">by AMZ</span> <BrandMarks size={22} /></p>
        <h1>Accès privé.</h1>
        <p className="gate-lede">Entre le mot de passe pour accéder au site.</p>
        <AccessForm next={next ?? "/"} />
      </div>
    </main>
  );
}
