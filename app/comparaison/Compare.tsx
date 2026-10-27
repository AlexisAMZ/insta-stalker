"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CutButton from "@/components/CutButton";
import PlatformSwitch from "@/components/PlatformSwitch";
import { Avatar } from "@/components/Person";
import { ARRIVED, CAPTURES, LEFT, NOT_BACK, PLATFORM_LABEL, type Platform } from "@/lib/sample";

type Filter = "all" | "out" | "back" | "in";

export default function Compare() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [filter, setFilter] = useState<Filter>("out");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("c3");
  const [to, setTo] = useState("c4");
  const label = PLATFORM_LABEL[platform];

  const rows = useMemo(() => {
    const all = [
      ...LEFT.map((m) => ({ ...m, kind: "out" as const })),
      ...NOT_BACK.map((m) => ({ ...m, kind: "back" as const })),
      ...ARRIVED.map((m) => ({ ...m, kind: "in" as const })),
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
            <p>Deux captures, face à face : qui est parti, qui ne te suit pas, qui est à couper.</p>
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
          <span><strong className="num down">{LEFT.length}</strong>{label.lost.toLowerCase()}</span>
          <span><strong className="num">{NOT_BACK.length}</strong>{label.notBack.toLowerCase()}</span>
          <span><Link href="/a-couper" className="summary-link">Voir ma liste « à couper » →</Link></span>
        </div>

        <div className="seg" role="group" aria-label="Filtrer" style={{ marginBottom: 16 }}>
          {([["out", label.lost], ["back", label.notBack], ["in", label.gained], ["all", "Tout"]] as const).map(([k, t]) => (
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
                    <Link href={`/personne/${r.handle}`}><b>@{r.handle}</b></Link>
                    <small>{r.note ?? r.name}</small>
                  </span>
                  <span className={`badge ${r.kind}`}>{r.kind === "in" ? label.badgeIn : r.kind === "back" ? label.badgeBack : label.badgeOut}</span>
                  <CutButton handle={r.handle} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
