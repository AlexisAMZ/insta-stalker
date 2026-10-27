"use client";

import { useMemo, useState } from "react";
import PlatformSwitch from "@/components/PlatformSwitch";
import { Avatar } from "@/components/Person";
import { ARRIVED, CAPTURES, LEFT, PLATFORM_LABEL, type Platform } from "@/lib/sample";

type Filter = "all" | "in" | "out";

export default function Compare() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("c3");
  const [to, setTo] = useState("c4");
  const label = PLATFORM_LABEL[platform];

  const rows = useMemo(() => {
    const all = [
      ...ARRIVED.map((m) => ({ ...m, kind: "in" as const })),
      ...LEFT.map((m) => ({ ...m, kind: "out" as const })),
    ];
    const needle = q.trim().toLowerCase();
    return all.filter(
      (r) =>
        (filter === "all" || r.kind === filter) &&
        (!needle || r.handle.toLowerCase().includes(needle) || r.name.toLowerCase().includes(needle)),
    );
  }, [filter, q]);

  return (
    <main className="page">
      <div className="wrap">
        <div className="page-head">
          <div>
            <h1>Comparaison</h1>
            <p>Deux captures, face à face : qui est entré, qui est sorti.</p>
          </div>
          <PlatformSwitch value={platform} onChange={setPlatform} />
        </div>

        <div className="tools">
          <label className="field">
            Capture de départ
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              {CAPTURES.map((c) => (
                <option key={c.id} value={c.id}>{c.label} · {c.date}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Capture d&rsquo;arrivée
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {CAPTURES.map((c) => (
                <option key={c.id} value={c.id}>{c.label} · {c.date}</option>
              ))}
            </select>
          </label>
          <label className="field grow">
            Chercher un nom
            <input type="search" placeholder="@pseudo ou prénom" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <button type="button" className="btn small">Télécharger le rapport (.txt)</button>
        </div>

        <div className="summary" aria-live="polite">
          <span><strong className="num up">+{ARRIVED.length}</strong>{label.gained.toLowerCase()}</span>
          <span><strong className="num down">−{LEFT.length}</strong>{label.lost.toLowerCase()}</span>
          <span>entre le {CAPTURES.find((c) => c.id === from)?.date.split(" · ")[0]} et le {CAPTURES.find((c) => c.id === to)?.date.split(" · ")[0]}</span>
        </div>

        <div className="seg" role="group" aria-label="Filtrer" style={{ marginBottom: 16 }}>
          {([["all", "Tout"], ["in", label.gained], ["out", label.lost]] as const).map(([k, t]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{t}</button>
          ))}
        </div>

        <section className="panel" style={{ padding: "8px 12px" }}>
          {rows.length === 0 ? (
            <p className="empty">Aucun nom ne correspond à « {q} ».</p>
          ) : (
            <ul className="rows">
              {rows.map((r) => (
                <li key={r.handle}>
                  <Avatar name={r.name} hue={r.hue} />
                  <span className="who">
                    <b>@{r.handle}</b>
                    <small>{r.note ?? r.name}</small>
                  </span>
                  <span className={`badge ${r.kind}`}>{r.kind === "in" ? label.gained.replace(/s$/, "") : label.lost.replace(/s$/, "")}</span>
                  <span className="when">{r.when}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
