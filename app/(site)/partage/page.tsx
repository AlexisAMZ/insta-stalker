import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";
import { STORIES } from "@/lib/stories";

export const metadata: Metadata = { title: "Partager", description: "Des stories prêtes à poster.", robots: NOINDEX };

export default function Page() {
  return (
    <main className="page">
      <div className="wrap">
        <div className="page-head">
          <div>
            <h1>Partage ton tri.</h1>
            <p>Des stories prêtes à poster. Sur la noire, pose un sticker sondage dans l&rsquo;espace libre.</p>
          </div>
        </div>
        <ul className="stories">
          {STORIES.map((s) => (
            <li key={s.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/partage/story/${s.id}`} alt={`Story : ${s.title}`} width={270} height={480} loading="lazy" />
              <a className="btn small" href={`/partage/story/${s.id}`} download={`unfollowd-${s.id}.png`}>
                Télécharger
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
