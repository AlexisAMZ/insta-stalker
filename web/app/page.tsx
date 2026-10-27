import Link from "next/link";
import { InstagramMark, SnapchatMark } from "@/components/Logos";
import { Avatar } from "@/components/Person";
import { ARRIVED, LEFT } from "@/lib/sample";

const FAQ = [
  ["Est-ce que ça prévient les gens que je regarde ?", "Non. L'outil lit seulement les listes que ton compte peut déjà voir. Il ne suit personne, n'aime rien et n'envoie aucun message."],
  ["Pourquoi le total ne tombe-t-il pas toujours juste ?", "Les comptes supprimés ou désactivés sont comptés par la plateforme mais n'ont plus de nom. Ils apparaissent comme lignes sans nom, et l'écart reste stable d'une capture à l'autre."],
  ["Combien de temps dure une capture ?", "Quelques minutes pour quelques milliers de comptes. La plateforme limite le débit, donc l'outil avance au rythme d'une personne qui fait défiler la liste."],
  ["Mes captures sont-elles publiques ?", "Non. Ce sont des fichiers datés, un nom par ligne, que tu gardes et que tu peux supprimer quand tu veux."],
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <h1>
            <span>Qui t&rsquo;a suivi.</span>
            <span>Qui est parti.</span>
          </h1>
          <div className="under">
            <p className="lede">
              AMZ Tracker garde une photo de tes abonnés Instagram et de tes amis Snapchat. Refais-en
              une plus tard : tu vois les arrivées et les départs, nom par nom.
            </p>
            <div className="cta">
              <Link className="btn primary" href="/dashboard">Lancer une capture</Link>
              <Link className="btn" href="/comparaison">Voir un exemple</Link>
            </div>
          </div>

          <div className="tiles">
            <article className="tile ig" aria-label="Exemple Instagram">
              <InstagramMark mono className="ghost" size={400} />
              <header><InstagramMark mono size={36} /> Instagram</header>
              <div>
                <ul>
                  <li>@lea.marchand <i>arrivée</i></li>
                  <li>@nina.sunset <i>arrivée</i></li>
                  <li><s>@clem.pxl</s> <i>départ</i></li>
                </ul>
                <p className="legend">Exemple · abonnés, du 20 au 27 oct.</p>
              </div>
            </article>
            <article className="tile sc" aria-label="Exemple Snapchat">
              <SnapchatMark mono className="ghost" size={400} />
              <header><SnapchatMark mono size={36} /> Snapchat</header>
              <div>
                <ul>
                  <li>@yanis_dlr <i>ajout</i></li>
                  <li><s>@rayan_off</s> <i>retrait</i></li>
                  <li>@camille.fr <i>ajout</i></li>
                </ul>
                <p className="legend">Exemple · amis, du 20 au 27 oct.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="comment">
        <div className="wrap split">
          <div className="intro">
            <h2>Deux captures. L&rsquo;écart parle.</h2>
            <p>Pas de graphique à interpréter : seuls les noms qui apparaissent ou disparaissent comptent.</p>
          </div>
          <ol className="steps">
            <li><div><h3>Fais une première capture</h3><p>Tu ouvres ton profil, tu lances la capture. Les listes défilent en direct, puis elles sont datées et gardées.</p></div></li>
            <li><div><h3>Reviens quelques jours plus tard</h3><p>Même geste, nouvelle capture. Plus tu espaces, plus l&rsquo;historique se remplit, sans rien à configurer.</p></div></li>
            <li><div><h3>Lis l&rsquo;écart</h3><p>Les arrivées d&rsquo;un côté, les départs de l&rsquo;autre. Tu cherches un nom, tu télécharges le rapport.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="wrap">
        <div className="band">
          <h2>Ce que tu lis à la fin.</h2>
          <div className="diff">
            <div className="col in">
              <h3>Arrivées <span className="num">+{ARRIVED.length}</span></h3>
              <ul className="list">
                {ARRIVED.slice(0, 4).map((m) => (
                  <li key={m.handle}>
                    <Avatar name={m.name} hue={m.hue} />
                    <span className="who"><b>@{m.handle}</b><small>{m.name}</small></span>
                    <span className="when">{m.when}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col out">
              <h3>Départs <span className="num">−{LEFT.length}</span></h3>
              <ul className="list">
                {LEFT.slice(0, 4).map((m) => (
                  <li key={m.handle}>
                    <Avatar name={m.name} hue={m.hue} />
                    <span className="who"><b>@{m.handle}</b><small>{m.note ?? m.name}</small></span>
                    <span className="when">{m.when}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link className="more" href="/comparaison">Ouvrir la comparaison complète →</Link>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div className="intro">
            <h2>Dit franchement.</h2>
            <p>Ce que l&rsquo;outil fait, ce qu&rsquo;il ne fait pas, et ce qu&rsquo;il ne peut pas garantir.</p>
          </div>
          <dl className="honest">
            <div><dt>Lecture seule</dt><dd>Il fait défiler des listes et lit des noms. Consulter une liste n&rsquo;envoie aucune notification.</dd></div>
            <div><dt>Ton compte</dt><dd>Il lit ce que ton compte a déjà le droit de voir. Aucune permission n&rsquo;est contournée.</dd></div>
            <div><dt>Limites de débit</dt><dd>En cas de blocage temporaire par la plateforme, il faut attendre quelques heures.</dd></div>
            <div><dt>Conditions d&rsquo;utilisation</dt><dd>Ce type d&rsquo;outil va contre les conditions d&rsquo;Instagram. Garde un usage léger et personnel.</dd></div>
          </dl>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap split">
          <div className="intro"><h2>Questions fréquentes.</h2></div>
          <div>
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="closer">
        <div className="wrap">
          <div className="block">
            <h2>Prêt pour la première capture ?</h2>
            <div className="cta">
              <Link className="btn primary" href="/dashboard">Ouvrir le tableau de bord</Link>
              <Link className="btn" href="/comparaison">Voir la comparaison</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <span>AMZ Tracker · maquette, données fictives</span>
          <span>Non affilié à Instagram ni à Snapchat.</span>
        </div>
      </footer>
    </main>
  );
}
