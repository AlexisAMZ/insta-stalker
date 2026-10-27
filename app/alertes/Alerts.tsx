"use client";

import { useState } from "react";

type Row = { id: string; title: string; text: string };

const ROWS: Row[] = [
  { id: "unfollow", title: "Me prévenir quand quelqu'un me quitte", text: "Dès qu'un nom disparaît de ta liste entre deux captures." },
  { id: "liar", title: "Me prévenir pour les écarts sur Snap", text: "Quand ce qu'on te dit ne colle pas avec ce que montre ton compte." },
  { id: "digest", title: "Résumé du dimanche", text: "Un récap de la semaine : qui est parti, qui est à couper." },
];

export default function Alerts() {
  const [on, setOn] = useState<Record<string, boolean>>({ unfollow: true, liar: true, digest: false });
  const [every, setEvery] = useState("1");
  const [saved, setSaved] = useState(false);

  return (
    <main className="page">
      <div className="wrap alerts">
        <div className="page-head">
          <div>
            <h1>Alertes</h1>
            <p>Laisse l&rsquo;outil regarder à ta place.</p>
          </div>
        </div>

        <section className="panel">
          <label className="field">
            Capture automatique
            <select value={every} onChange={(e) => { setEvery(e.target.value); setSaved(false); }}>
              <option value="1">Tous les jours</option>
              <option value="3">Tous les 3 jours</option>
              <option value="7">Toutes les semaines</option>
            </select>
          </label>

          <ul className="switches">
            {ROWS.map((r) => (
              <li key={r.id}>
                <div>
                  <b>{r.title}</b>
                  <p>{r.text}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on[r.id]}
                  aria-label={r.title}
                  className="switch"
                  onClick={() => { setOn({ ...on, [r.id]: !on[r.id] }); setSaved(false); }}
                />
              </li>
            ))}
          </ul>

          <div className="cta-row">
            <button type="button" className="btn primary" onClick={() => setSaved(true)}>Enregistrer</button>
            {saved && <span role="status" className="status-ok">Réglages enregistrés (maquette).</span>}
          </div>
        </section>
      </div>
    </main>
  );
}
