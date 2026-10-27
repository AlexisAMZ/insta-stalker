import type { Metadata } from "next";
import Link from "next/link";
import { BrandMarks, LogoMark } from "@/components/Logos";
import WaitlistForm from "./WaitlistForm";

export const metadata: Metadata = {
  title: "Sois prévenu du lancement",
  description: "unfollowd te dit qui t'a unfollow, qui ne te suit pas en retour et qui te ment. Laisse ton e-mail, on te prévient le jour du lancement.",
  robots: { index: false, follow: false },
};

const WORDS = ["L'ère", "du", "stalking", "commence."];
export default function Page() {
  return (
    <main className="soon">
      <div className="soon-box">
        <p className="brand">
          <LogoMark size={36} />
          unfollowd<span className="by">by AMZ</span> <BrandMarks size={22} />
        </p>
        <h1 className="soon-title">
          {WORDS.map((w, i) => (
            <span key={w}>
              <span className={`w${w === "stalking" ? " hl" : ""}`} style={{ ["--i" as string]: i }}>{w}</span>{" "}
            </span>
          ))}
        </h1>
        <p className="soon-lede">
          Qui t&rsquo;a unfollow. Qui ne te suit pas en retour. Qui te ment. Sur Instagram et Snapchat.
        </p>
        <h2 className="soon-sub">Sois prévenu du lancement.</h2>
        <p className="soon-lede">Laisse ton e-mail : tu en reçois un seul, le jour où c&rsquo;est prêt.</p>
        <WaitlistForm />
        <p className="soon-note">
          Pas de spam, pas de revente. Tu peux demander la suppression de ton adresse à tout moment.{" "}
          <Link href="/legal#confidentialite">Confidentialité</Link>
        </p>
      </div>
    </main>
  );
}
