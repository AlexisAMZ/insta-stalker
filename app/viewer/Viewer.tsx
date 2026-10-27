"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/Person";
import type { IgProfile, IgStoryItem } from "@/lib/instagram";

type Result = { profile: IgProfile; stories: IgStoryItem[]; storiesStatus: "ok" | "none" | "private" | "unavailable" };

const media = (url: string, download?: string) =>
  `/api/media?u=${encodeURIComponent(url)}${download ? `&dl=${encodeURIComponent(download)}` : ""}`;

const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString("fr-FR"));
const ago = (t: number | null) => {
  if (!t) return "";
  const h = Math.max(0, Math.round((Date.now() / 1000 - t) / 3600));
  return h < 1 ? "il y a moins d'1 h" : `il y a ${h} h`;
};

export default function Viewer() {
  const [q, setQ] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<Result | null>(null);
  const [index, setIndex] = useState(0);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setState("loading");
    setError("");
    setIndex(0);
    try {
      const res = await fetch(`/api/viewer?u=${encodeURIComponent(q)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Recherche impossible.");
      setData(body as Result);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recherche impossible.");
      setState("error");
    }
  }

  const count = data?.stories.length ?? 0;
  const go = useCallback((d: number) => setIndex((i) => Math.min(Math.max(i + d, 0), Math.max(count - 1, 0))), [count]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const p = data?.profile;
  const story = data?.stories[index];

  return (
    <main className="page">
      <div className="wrap viewer">
        <div className="page-head">
          <div>
            <h1>Stories et photo de profil.</h1>
            <p>Regarde les stories d&rsquo;un compte public et récupère sa photo en grand. Ton nom n&rsquo;apparaît dans aucune liste de vues.</p>
          </div>
        </div>

        <form className="viewer-form" onSubmit={search}>
          <label className="field grow">
            Compte Instagram
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="@pseudo ou lien du profil"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <button className="btn primary" type="submit" disabled={state === "loading"}>
            {state === "loading" ? "Recherche…" : "Voir"}
          </button>
        </form>

        {state === "error" && <p className="viewer-error" role="alert">{error}</p>}

        {state === "done" && p && (
          <div className="viewer-result">
            <section className="panel profile">
              <div className="profile-pic">
                {p.picHd ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media(p.picHd)} alt={`Photo de profil de @${p.username}`} width={160} height={160} />
                ) : (
                  <Avatar name={p.fullName || p.username} hue={200} />
                )}
              </div>
              <div className="profile-info">
                <h2>@{p.username}{p.isVerified && <span className="verified" title="Compte certifié"> ✓</span>}</h2>
                {p.fullName && <p className="profile-name">{p.fullName}</p>}
                {p.bio && <p className="profile-bio">{p.bio}</p>}
                <ul className="profile-stats">
                  <li><b className="num">{fmt(p.posts)}</b> publications</li>
                  <li><b className="num">{fmt(p.followers)}</b> abonnés</li>
                  <li><b className="num">{fmt(p.following)}</b> abonnements</li>
                </ul>
                {p.picHd && (
                  <a className="btn small" href={media(p.picHd, `${p.username}-profil.jpg`)}>Télécharger la photo en grand</a>
                )}
              </div>
            </section>

            <section className="panel stories-panel" aria-labelledby="st-t">
              <h2 id="st-t">Stories</h2>
              {data.storiesStatus === "private" && <p className="empty">Ce compte est privé : ses stories et sa photo ne sont visibles que par ses abonnés.</p>}
              {data.storiesStatus === "unavailable" && <p className="empty">Les stories ne sont pas disponibles pour l&rsquo;instant. La photo de profil reste accessible.</p>}
              {data.storiesStatus === "none" && <p className="empty">Aucune story active en ce moment.</p>}
              {data.storiesStatus === "ok" && story && (
                <div className="player">
                  <div className="segments" aria-hidden="true">
                    {data.stories.map((s, i) => (
                      <i key={s.id} className={i <= index ? "on" : ""} />
                    ))}
                  </div>
                  <div className="frame">
                    {story.kind === "video" ? (
                      <video key={story.id} src={media(story.url)} poster={story.poster ? media(story.poster) : undefined} controls autoPlay muted playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={story.id} src={media(story.url)} alt={`Story ${index + 1} sur ${count} de @${p.username}`} />
                    )}
                    <button type="button" className="hit prev" onClick={() => go(-1)} disabled={index === 0} aria-label="Story précédente" />
                    <button type="button" className="hit next" onClick={() => go(1)} disabled={index >= count - 1} aria-label="Story suivante" />
                  </div>
                  <div className="player-bar">
                    <span>{index + 1} / {count} · {ago(story.takenAt)}</span>
                    <a className="btn small" href={media(story.url, `${p.username}-story-${index + 1}.${story.kind === "video" ? "mp4" : "jpg"}`)}>Télécharger</a>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        <p className="viewer-note">
          Comptes publics uniquement. Les stories durent 24 h. N&rsquo;utilise pas cet outil pour harceler quelqu&rsquo;un.
        </p>
      </div>
    </main>
  );
}
