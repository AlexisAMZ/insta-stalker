"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PlatformSwitch from "@/components/PlatformSwitch";
import { Avatar } from "@/components/Person";
import { ACCOUNT, CAPTURES, LEFT, NOT_BACK, PLATFORM_LABEL, type Platform } from "@/lib/sample";

export default function Dashboard() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const label = PLATFORM_LABEL[platform];
  const acc = ACCOUNT[platform];
  const isIg = platform === "instagram";

  useEffect(() => () => clearTimeout(timer.current), []);

  function launch() {
    setDone(false);
    setRunning(true);
    timer.current = setTimeout(() => {
      setRunning(false);
      setDone(true);
    }, 4000);
  }

  return (
    <main className="page">
      <div className="wrap">
        <div className="page-head">
          <div>
            <h1>Tableau de bord</h1>
            <p>
              Compte suivi : <b>@{acc.handle}</b>
            </p>
          </div>
          <PlatformSwitch
            value={platform}
            onChange={(p) => {
              setPlatform(p);
              setRunning(false);
              setDone(false);
            }}
          />
        </div>

        <section className="panel capture" aria-labelledby="cap-t">
          <div>
            <h2 id="cap-t">Nouvelle capture</h2>
            <p>
              {isIg
                ? "Ouvre ton profil Instagram dans un autre onglet, puis lance la capture : abonnés et abonnements défilent en direct."
                : "Ouvre ta liste d'amis Snapchat, puis lance la capture : les amis défilent en direct."}
            </p>
          </div>
          <button className="btn primary" type="button" onClick={launch} disabled={running}>
            {running ? "Capture en cours…" : done ? "Relancer une capture" : "Lancer la capture"}
          </button>
          <div className={`bar${running ? " run" : ""}`} aria-hidden="true">
            <i style={done ? { width: "100%" } : undefined} />
          </div>
          <p className="status-line" role="status">
            {running ? "Lecture de la liste en cours, merci de laisser l'onglet ouvert." : done ? `Capture terminée : ${acc.followers.toLocaleString("fr-FR")} ${label.follows} enregistrés.` : "Dernière capture : aujourd'hui, 14:32."}
          </p>
        </section>

        <div className="grid2">
          <section className="panel" aria-labelledby="led-t">
            <h2 id="led-t" className="sr">Comptes</h2>
            <table className="ledger">
              <tbody>
                <tr>
                  <th scope="row">{label.lost}</th>
                  <td className="big num down">{LEFT.length}</td>
                  <td className="delta num">depuis le 20 oct.</td>
                </tr>
                <tr>
                  <th scope="row">{isIg ? "Abonnés" : "Amis"}</th>
                  <td className="big num">{acc.followers.toLocaleString("fr-FR")}</td>
                  <td className="delta num"><span className="up">+8</span> / <span className="down">−6</span></td>
                </tr>
                {isIg && (
                  <tr>
                    <th scope="row">Abonnements</th>
                    <td className="big num">{acc.following.toLocaleString("fr-FR")}</td>
                    <td className="delta num"><span className="up">+2</span> / <span className="down">−5</span></td>
                  </tr>
                )}
                <tr>
                  <th scope="row">{label.notBack}</th>
                  <td className="big num">{isIg ? 94 : 12}</td>
                  <td className="delta num">au total</td>
                </tr>
              </tbody>
            </table>
            <p className="note">
              Le profil annonce {(acc.followers + 3).toLocaleString("fr-FR")}, la liste en compte {acc.followers.toLocaleString("fr-FR")} : 3 lignes sans nom, des comptes désactivés. Rien de manqué.
            </p>
          </section>

          <section className="panel" aria-labelledby="his-t">
            <h2 id="his-t" style={{ fontSize: "1.4rem", marginBottom: 6 }}>Historique</h2>
            <ul className="hist">
              {CAPTURES.map((c, i) => (
                <li key={c.id}>
                  <b>{c.label}</b>
                  <span className="c num">{(isIg ? c.count : Math.round(c.count * 0.27)).toLocaleString("fr-FR")}</span>
                  <small>{c.date}{i === 0 ? " · la plus récente" : ""}</small>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="two">
          <section className="panel col out">
            <h3>{label.lost} <span className="num">{LEFT.length}</span></h3>
            <ul className="list">
              {LEFT.slice(0, 5).map((m) => (
                <li key={m.handle}>
                  <Avatar name={m.name} hue={m.hue} />
                  <span className="who"><b>@{m.handle}</b><small>{m.note ?? m.name}</small></span>
                  <span className="when">{m.when}</span>
                </li>
              ))}
            </ul>
            <Link className="more" href="/comparaison">Tout voir →</Link>
          </section>
          <section className="panel col out">
            <h3>{label.notBack} <span className="num">{NOT_BACK.length}</span></h3>
            <ul className="list">
              {NOT_BACK.map((m) => (
                <li key={m.handle}>
                  <Avatar name={m.name} hue={m.hue} />
                  <span className="who"><b>@{m.handle}</b><small>{m.note ?? m.name}</small></span>
                  <span className="when">{m.when}</span>
                </li>
              ))}
            </ul>
            <Link className="more" href="/comparaison">Tout voir →</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
