import { STORIES } from "@/lib/stories";

export const metadata = { title: "Partager — unfollowd" };

export default function Page() {
  return (
    <main className="page">
      <div className="wrap">
        <div className="page-head">
          <div>
            <h1>Partage ton tri.</h1>
            <p>Des stories prêtes à poster. Sur celle avec l&rsquo;emplacement, pose un sticker mention @ pour taguer qui tu veux.</p>
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
