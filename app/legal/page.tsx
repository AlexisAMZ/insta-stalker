import type { Metadata } from "next";
import { isLaunched, NOINDEX } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales et confidentialité",
  description: "Mentions légales, politique de confidentialité et conditions d'utilisation de unfollowd by AMZ.",
  alternates: { canonical: "/legal" },
  robots: isLaunched() ? { index: true, follow: true } : NOINDEX,
};

export default function Page() {
  return (
    <main className="page">
      <div className="wrap prose">
        <h1>Mentions légales, confidentialité et conditions.</h1>

        <h2 id="mentions">Mentions légales</h2>
        <p>Éditeur : [à compléter : nom ou raison sociale, contact].</p>
        <p>Hébergeur : Vercel Inc. (États-Unis).</p>
        <p>unfollowd (by AMZ) n&rsquo;est affilié ni à Instagram, ni à Meta, ni à Snapchat, ni à Snap Inc. Ces noms et logos appartiennent à leurs propriétaires.</p>

        <h2 id="confidentialite">Confidentialité</h2>
        <p>L&rsquo;outil lit les listes que ton compte peut déjà voir et en garde des captures datées, un nom par ligne.</p>
        <p>Où ces captures sont stockées, combien de temps, et comment les supprimer : [à préciser selon l&rsquo;hébergement retenu].</p>
        <h3>Liste d&rsquo;attente</h3>
        <p>Si tu laisses ton e-mail pour être prévenu du lancement, nous enregistrons ton adresse, la date d&rsquo;inscription et, le cas échéant, la source du lien (par exemple « snapchat »).</p>
        <p>Finalité : t&rsquo;envoyer un seul e-mail au lancement. Base légale : ton consentement, donné en cochant la case du formulaire. Nous ne revendons pas ton adresse.</p>
        <p>Stockage : base de données hébergée chez Upstash [région à préciser]. Durée : jusqu&rsquo;à l&rsquo;envoi du message de lancement, puis suppression, et au plus 12 mois.</p>
        <p>Tes droits : accès, rectification, suppression, retrait du consentement à tout moment, en écrivant à [adresse de contact à compléter].</p>
        <p>Ta liste « à dégager » reste dans ton navigateur.</p>
        <p>Quand tu cherches un compte dans le viewer, le pseudo recherché est transmis à un prestataire technique de collecte (Scrapfly) pour récupérer les informations publiques du compte. Aucune recherche n&rsquo;est associée à ton identité dans cette version.</p>

        <h2 id="conditions">Conditions d&rsquo;utilisation</h2>
        <p>Les captures de listes portent sur tes propres comptes. Le viewer de stories ne montre que des comptes publics.</p>
        <p>Tu ne republies pas le contenu d&rsquo;un compte (photo, story) sans l&rsquo;accord de son auteur.</p>
        <p>Tu t&rsquo;engages à ne pas t&rsquo;en servir pour harceler, menacer ou contacter de façon répétée une personne.</p>
        <p>Les plateformes interdisent en général les outils automatisés dans leurs conditions : ton compte peut être limité. Garde un usage léger.</p>
        <p>L&rsquo;outil montre des faits sur des listes. Il ne dit pas ce qu&rsquo;une personne pense et ne prouve aucune intention.</p>
      </div>
    </main>
  );
}
