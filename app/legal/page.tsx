export const metadata = { title: "Mentions et confidentialité — unfollowd" };

export default function Page() {
  return (
    <main className="page">
      <div className="wrap prose">
        <h1>Mentions légales, confidentialité et conditions.</h1>
        <p className="note">Projet de texte pour la maquette. À faire relire avant toute mise en ligne publique.</p>

        <h2 id="mentions">Mentions légales</h2>
        <p>Éditeur : [à compléter : nom ou raison sociale, contact].</p>
        <p>Hébergeur : Vercel Inc. (États-Unis).</p>
        <p>unfollowd (by AMZ) n&rsquo;est affilié ni à Instagram, ni à Meta, ni à Snapchat, ni à Snap Inc. Ces noms et logos appartiennent à leurs propriétaires.</p>

        <h2 id="confidentialite">Confidentialité</h2>
        <p>L&rsquo;outil lit les listes que ton compte peut déjà voir et en garde des captures datées, un nom par ligne.</p>
        <p>Où ces captures sont stockées, combien de temps, et comment les supprimer : [à préciser selon l&rsquo;hébergement retenu].</p>
        <p>Cette maquette n&rsquo;enregistre aucune donnée personnelle côté serveur. Ta liste « à couper » reste dans ton navigateur.</p>

        <h2 id="conditions">Conditions d&rsquo;utilisation</h2>
        <p>Usage personnel : tu n&rsquo;utilises l&rsquo;outil que sur tes propres comptes.</p>
        <p>Tu t&rsquo;engages à ne pas t&rsquo;en servir pour harceler, menacer ou contacter de façon répétée une personne.</p>
        <p>Les plateformes interdisent en général les outils automatisés dans leurs conditions : ton compte peut être limité. Garde un usage léger.</p>
        <p>L&rsquo;outil montre des faits sur des listes. Il ne dit pas ce qu&rsquo;une personne pense et ne prouve aucune intention.</p>
      </div>
    </main>
  );
}
