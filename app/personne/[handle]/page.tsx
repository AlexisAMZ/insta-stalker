import Link from "next/link";
import { notFound } from "next/navigation";
import CutButton from "@/components/CutButton";
import { Avatar } from "@/components/Person";
import { getPerson, KIND_LABEL, PEOPLE } from "@/lib/people";

export function generateStaticParams() {
  return PEOPLE.map((p) => ({ handle: p.handle }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return { title: `@${handle} — AMZ Tracker` };
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const p = getPerson(handle);
  if (!p) notFound();

  return (
    <main className="page">
      <div className="wrap dossier">
        <Link className="back" href="/comparaison">← Retour à la liste</Link>
        <header className="dossier-head">
          <Avatar name={p.name} hue={p.hue} />
          <div>
            <h1>@{p.handle}</h1>
            <p>{p.name} · {p.platform === "instagram" ? "Instagram" : "Snapchat"}</p>
          </div>
          <CutButton handle={p.handle} large />
        </header>

        <p className="dossier-kind">{KIND_LABEL[p.kind]}</p>

        {p.said && (
          <section className="panel said-box">
            <p className="said">{p.said}</p>
            <p className="fact">{p.fact}</p>
          </section>
        )}

        <section className="panel" aria-labelledby="tl">
          <h2 id="tl">Ce qu&rsquo;on voit dans tes captures</h2>
          <ol className="timeline">
            {p.events.map((e) => (
              <li key={e.date + e.text}>
                <span className="when">{e.date}</span>
                <span>{e.text}</span>
              </li>
            ))}
          </ol>
          <p className="note">
            Un fait n&rsquo;est pas une intention. À toi de décider si cette personne mérite encore sa place.
          </p>
        </section>
      </div>
    </main>
  );
}
