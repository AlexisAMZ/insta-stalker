import { BrandMarks, LogoMark } from "@/components/Logos";
import AdminAccess from "./AdminAccess";
import { publicWaitlistCount } from "@/lib/waitlist-store";
import WaitlistForm from "./WaitlistForm";

// Page d'attente partagée : /bientot (et la racine avant lancement) l'affichent fermée, /acces ouvre l'accès admin.
const WORDS = ["L'ère", "du", "stalking", "commence."];
export default async function Teaser({ adminOpen = false, next = "/" }: { adminOpen?: boolean; next?: string }) {
  const count = await publicWaitlistCount();
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
        {count !== null && (
          <p className="soon-count">
            <b className="num">{count.toLocaleString("fr-FR")}</b> {count > 1 ? "personnes sont déjà inscrites" : "personne est déjà inscrite"}
          </p>
        )}
        <WaitlistForm />
        <p className="soon-note">
          Pas de spam, pas de revente. Tu peux demander la suppression de ton adresse à tout moment.
        </p>
        <details className="privacy" id="confidentialite">
          <summary>Confidentialité et cookies</summary>
          <p>
            Ce que nous enregistrons : ton e-mail, la date d&rsquo;inscription et, le cas échéant, la source du lien (par exemple « snapchat »).
            But : t&rsquo;envoyer un seul e-mail au lancement. Base légale : ton consentement, donné en cochant la case. Nous ne revendons pas ton adresse.
          </p>
          <p>
            Stockage : base de données Postgres chez Neon, aux États-Unis (Virginie). Durée : jusqu&rsquo;à l&rsquo;envoi du message de lancement, puis suppression, et au plus 12 mois.
            Tes droits (accès, suppression, retrait du consentement) : écris à [adresse de contact à compléter].
          </p>
          <p>
            Mesure d&rsquo;audience : Google Analytics, uniquement si tu l&rsquo;acceptes dans le bandeau. Sans accord, aucun cookie de mesure n&rsquo;est déposé.
          </p>
        </details>
        <AdminAccess open={adminOpen} next={next} />
      </div>
    </main>
  );
}
