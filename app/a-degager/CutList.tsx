"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Person";
import { useCutList } from "@/lib/cutlist";
import { getPerson, KIND_LABEL } from "@/lib/people";

export default function CutList() {
  const { list, toggle, clear } = useCutList();
  const [copied, setCopied] = useState(false);
  const people = list.map((h) => getPerson(h)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const text = people.map((p) => `@${p.handle}`).join("\n");

  function download() {
    const url = URL.createObjectURL(new Blob([text + "\n"], { type: "text/plain" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "a-degager.txt" });
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible */
    }
  }

  return (
    <main className="page">
      <div className="wrap">
        <div className="page-head">
          <div>
            <h1>À dégager</h1>
            <p>Ceux que tu as marqués. L&rsquo;outil ne supprime personne : tu fais le ménage toi-même dans l&rsquo;appli.</p>
          </div>
          {people.length > 0 && (
            <div className="cta-row">
              <button type="button" className="btn small" onClick={copy}>{copied ? "Copié ✓" : "Copier la liste"}</button>
              <button type="button" className="btn small primary" onClick={download}>Télécharger (.txt)</button>
            </div>
          )}
        </div>

        {people.length === 0 ? (
          <section className="panel empty-state">
            <h2>Personne à dégager pour l&rsquo;instant.</h2>
            <p>Sur la liste, touche « À dégager ? » à côté d&rsquo;un nom pour le mettre ici.</p>
            <Link className="btn primary" href="/comparaison">Voir la liste</Link>
          </section>
        ) : (
          <section className="panel" style={{ padding: "8px 12px" }}>
            <ul className="rows">
              {people.map((p) => (
                <li key={p.handle}>
                  <Avatar name={p.name} hue={p.hue} />
                  <span className="who">
                    <Link href={`/personne/${p.handle}`}><b>@{p.handle}</b></Link>
                    <small>{KIND_LABEL[p.kind]}</small>
                  </span>
                  <span className="when">{p.platform === "instagram" ? "Instagram" : "Snapchat"}</span>
                  <button type="button" className="flag" onClick={() => toggle(p.handle)}>Retirer</button>
                </li>
              ))}
            </ul>
            <div className="cta-row" style={{ margin: "8px 8px 12px" }}>
              <Link className="btn small primary" href="/partage">Partager mon tri en story</Link>
              <button type="button" className="linkbtn" onClick={clear}>Tout vider</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
