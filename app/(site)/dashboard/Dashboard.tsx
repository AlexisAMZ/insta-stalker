"use client";

import Link from "next/link";
import { useState } from "react";
import CapturePanel from "@/components/CapturePanel";
import PlatformSwitch from "@/components/PlatformSwitch";
import { Avatar } from "@/components/Person";
import { ACCOUNT, CAPTURES, LEFT, NOT_BACK, PLATFORM_LABEL, type Platform } from "@/lib/sample";

export default function Dashboard({ initialEmpty }: { initialEmpty: boolean }) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [hasData, setHasData] = useState(!initialEmpty);
  const label = PLATFORM_LABEL[platform];
  const acc = ACCOUNT[platform];
  const isIg = platform === "instagram";

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
          <PlatformSwitch value={platform} onChange={setPlatform} />
        </div>

        {hasData && (
          <section className="verdict" aria-labelledby="verdict-t">
            <h2 id="verdict-t">
              <span className="num">{LEFT.length}</span> personnes {isIg ? "sont parties de ta liste" : "t'ont retiré de leurs amis"}.
            </h2>
            <p>Depuis ta capture du 20 octobre.</p>
            <ul className="chips">
              {LEFT.slice(0, 4).map((m) => (
                <li key={m.handle}>
                  <Link href={`/personne/${m.handle}`}>@{m.handle}</Link>
                </li>
              ))}
              <li>
                <Link href="/comparaison" className="chip-more">Voir les {LEFT.length} →</Link>
              </li>
            </ul>
          </section>
        )}

        <CapturePanel platform={platform} first={!hasData} onDone={() => setHasData(true)} />

        {hasData && (
          <>
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
                      <span className="who"><Link href={`/personne/${m.handle}`}><b>@{m.handle}</b></Link><small>{m.note ?? m.name}</small></span>
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
                      <span className="who"><Link href={`/personne/${m.handle}`}><b>@{m.handle}</b></Link><small>{m.note ?? m.name}</small></span>
                      <span className="when">{m.when}</span>
                    </li>
                  ))}
                </ul>
                <Link className="more" href="/comparaison">Tout voir →</Link>
              </section>
            </div>

            <aside className="panel nudge">
              <div>
                <h2>Ne regarde plus à la main.</h2>
                <p>Capture automatique et alerte dès que quelqu&rsquo;un te quitte.</p>
              </div>
              <Link className="btn" href="/alertes">Régler les alertes</Link>
            </aside>
          </>
        )}
      </div>
    </main>
  );
}
