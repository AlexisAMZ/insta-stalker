"use client";

import { useEffect, useRef, useState } from "react";
import { ACCOUNT, PLATFORM_LABEL, type Platform } from "@/lib/sample";

const PREFIX = ["lea", "tom", "nina", "yan", "cam", "sof", "math", "jo", "clem", "ana", "ray", "mar", "ines", "kev", "jul", "matt", "sarah", "enzo", "lola", "hugo"];
const handleAt = (i: number) => `${PREFIX[i % PREFIX.length]}${i % 3 === 0 ? "." : "_"}${((i * 7919) % 97) + 3}`;
const TICKS = 72;
const TICK_MS = 90;

type Props = { platform: Platform; first: boolean; onDone: () => void };

export default function CapturePanel({ platform, first, onDone }: Props) {
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [tick, setTick] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const label = PLATFORM_LABEL[platform];
  const acc = ACCOUNT[platform];
  const isIg = platform === "instagram";

  // réinitialise quand on change de plateforme
  useEffect(() => {
    setPhase("idle");
    setTick(0);
  }, [platform]);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setTick((t) => {
        if (t + 1 >= TICKS) {
          clearInterval(id);
          setPhase("done");
          onDoneRef.current();
          return TICKS;
        }
        return t + 1;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  const pct = tick / TICKS;
  const split = isIg ? 0.62 : 1;
  const inFirst = pct <= split;
  const followersNow = Math.round(acc.followers * Math.min(pct / split, 1));
  const followingNow = isIg && pct > split ? Math.round(acc.following * ((pct - split) / (1 - split))) : 0;
  const feed = Array.from({ length: 5 }, (_, k) => tick * 3 - k).filter((i) => i > 0);
  const running = phase === "running";

  return (
    <section className={`panel capture${first ? " first" : ""}`} aria-labelledby="cap-t">
      <div className="capture-head">
        <div>
          <h2 id="cap-t">{first ? "Aucune capture pour l'instant." : "Nouvelle capture"}</h2>
          <p>
            {first
              ? "Fais la première : dans quelques minutes, tu sauras exactement qui est dans ta liste. La suivante dira qui est parti."
              : isIg
                ? "Ouvre ton profil Instagram dans un autre onglet, puis lance la capture : abonnés et abonnements défilent en direct."
                : "Ouvre ta liste d'amis Snapchat, puis lance la capture : les amis défilent en direct."}
          </p>
        </div>
        <button className="btn primary" type="button" onClick={() => { setTick(0); setPhase("running"); }} disabled={running}>
          {running ? "Capture en cours…" : phase === "done" ? "Relancer une capture" : first ? "Lancer la première capture" : "Lancer la capture"}
        </button>
      </div>

      {(running || phase === "done") && (
        <div className="live">
          <div className="live-count" aria-live="polite">
            <span className="num big">{(inFirst ? followersNow : acc.followers).toLocaleString("fr-FR")}</span>
            <span>{label.follows} lus{isIg && !inFirst ? "" : running ? "…" : ""}</span>
            {isIg && !inFirst && (
              <>
                <span className="num big sub">{followingNow.toLocaleString("fr-FR")}</span>
                <span>abonnements lus…</span>
              </>
            )}
          </div>
          <ul className="live-feed" aria-hidden="true">
            {(running ? feed : []).map((i) => (
              <li key={i}>
                <span className="dot" style={{ background: `hsl(${(i * 47) % 360} 85% 70%)` }} />
                @{handleAt(i)}
              </li>
            ))}
          </ul>
          <div className="bar" aria-hidden="true">
            <i style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>
          <p className="status-line" role="status">
            {phase === "done"
              ? `Capture terminée : ${acc.followers.toLocaleString("fr-FR")} ${label.follows}${isIg ? `, ${acc.following} abonnements` : ""}, 3 lignes sans nom (comptes désactivés).`
              : `Lecture de la liste ${inFirst ? (isIg ? "des abonnés" : "des amis") : "des abonnements"}, laisse l'onglet ouvert.`}
          </p>
        </div>
      )}
    </section>
  );
}
