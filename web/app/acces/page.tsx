import AccessForm from "./AccessForm";
import { BrandMarks } from "@/components/Logos";

export const metadata = { title: "Accès — AMZ Tracker" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="gate">
      <div className="gate-box">
        <p className="brand">AMZ Tracker <BrandMarks size={22} /></p>
        <h1>Accès privé.</h1>
        <p className="gate-lede">Entre le mot de passe pour ouvrir la maquette.</p>
        <AccessForm next={next ?? "/"} />
      </div>
    </main>
  );
}
