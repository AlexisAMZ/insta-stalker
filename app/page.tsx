import Link from "next/link";
import { InstagramMark, SnapchatMark } from "@/components/Logos";
import { Avatar } from "@/components/Person";
import { CONTRADICTIONS, LEFT, NOT_BACK } from "@/lib/sample";

const FAQ = [
  ["Un unfollow, ça veut dire qu'il me déteste ?", "Pas forcément. L'outil te donne un fait : cette personne n'est plus dans ta liste. À toi de juger si ça compte, et si elle mérite encore une place dans ta vie."],
  ["Est-ce que ça prévient les gens que je regarde ?", "Non. L'outil lit seulement les listes que ton compte peut déjà voir. Il ne suit personne, n'aime rien et n'envoie aucun message."],
  ["Comment tu sais qui me ment sur Snapchat ?", "L'outil recoupe ce que ton compte peut voir et te montre les écarts, nom par nom. Il donne des faits, pas des verdicts : c'est toi qui conclus."],
  ["Pourquoi le total ne tombe-t-il pas toujours juste ?", "Les comptes supprimés ou désactivés sont comptés par la plateforme mais n'ont plus de nom. Ils apparaissent comme lignes sans nom, et l'écart reste stable d'une capture à l'autre."],
  ["Mes captures sont-elles publiques ?", "Non. Ce sont des fichiers datés, un nom par ligne, que tu gardes et que tu peux supprimer quand tu veux."],
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <h1>
            <span>Qui t&rsquo;a unfollow.</span>
            <span>Qui te ment.</span>
          </h1>
          <div className="under">
            <p className="lede">
              Elle ne te répond pas, mais tu vois qu&rsquo;elle envoie des snaps à d&rsquo;autres. Lui t&rsquo;a
              unfollow sans rien dire. AMZ Tracker te montre nom par nom qui est parti, qui ne te suit pas en
              retour et qui te ment. Pour faire le tri, et couper ceux qui ne méritent pas ta place.
            </p>
            <div className="cta">
              <Link className="btn primary" href="/dashboard">Voir qui est parti</Link>
              <Link className="btn" href="/comparaison">Voir un exemple</Link>
            </div>
          </div>

          <div className="tiles">
            <article className="tile ig" aria-label="Exemple Instagram">
              <InstagramMark mono className="ghost" size={400} />
              <header><InstagramMark mono size={36} /> Instagram</header>
              <div>
                <ul>
                  <li>@clem.pxl <i>unfollow</i></li>
                  <li>@anaisbtn <i>unfollow</i></li>
                  <li>@kev_ofc <i>ne te suit pas</i></li>
                </ul>
                <p className="legend">Exemple · qui est parti, du 20 au 27 oct.</p>
              </div>
            </article>
            <article className="tile sc" aria-label="Exemple Snapchat">
              <SnapchatMark mono className="ghost" size={400} />
              <header><SnapchatMark mono size={36} /> Snapchat</header>
              <div>
                <ul>
                  <li>@enzo_bz <i>t&rsquo;a retiré</i></li>
                  <li>@lola.mrt <i>t&rsquo;a retiré</i></li>
                  <li>@hugo.k <i>dit l&rsquo;inverse</i></li>
                </ul>
                <p className="legend">Exemple · qui te ment, du 20 au 27 oct.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="comment">
        <div className="wrap split">
          <div className="intro">
            <h2>Deux captures. Les noms tombent.</h2>
            <p>Pas de graphique à interpréter : seuls comptent les noms qui disparaissent de ta liste.</p>
          </div>
          <ol className="steps">
            <li><div><h3>Fais une première capture</h3><p>Tu ouvres ton profil, tu lances la capture. Tes listes défilent en direct, puis elles sont datées et gardées.</p></div></li>
            <li><div><h3>Reviens quelques jours plus tard</h3><p>Même geste, nouvelle capture. Ceux qui sont partis entre-temps apparaissent tout seuls.</p></div></li>
            <li><div><h3>Fais le tri</h3><p>Tu vois qui t&rsquo;a unfollow, qui ne te suit pas en retour, qui te ment. Tu marques ceux à couper et tu télécharges la liste.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="wrap">
        <div className="band">
          <h2>Ceux qui ne sont plus là.</h2>
          <div className="diff">
            <div className="col out">
              <h3>Ils t&rsquo;ont unfollow <span className="num">{LEFT.length}</span></h3>
              <ul className="list">
                {LEFT.slice(0, 4).map((m) => (
                  <li key={m.handle}>
                    <Avatar name={m.name} hue={m.hue} />
                    <span className="who"><Link href={`/personne/${m.handle}`}><b>@{m.handle}</b></Link><small>{m.note ?? m.name}</small></span>
                    <span className="when">{m.when}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col out">
              <h3>Ne te suivent pas en retour <span className="num">{NOT_BACK.length}</span></h3>
              <ul className="list">
                {NOT_BACK.map((m) => (
                  <li key={m.handle}>
                    <Avatar name={m.name} hue={m.hue} />
                    <span className="who"><Link href={`/personne/${m.handle}`}><b>@{m.handle}</b></Link><small>{m.note ?? m.name}</small></span>
                    <span className="when">{m.when}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link className="more" href="/comparaison">Ouvrir la liste complète →</Link>
        </div>
      </section>

      <section className="wrap" style={{ marginTop: 16 }}>
        <div className="band snap">
          <h2>Sur Snap : qui te ment.</h2>
          <p className="band-lede">Ce qu&rsquo;on te dit d&rsquo;un côté, ce que ton compte montre de l&rsquo;autre. Exemples fictifs.</p>
          <ul className="lies">
            {CONTRADICTIONS.map((c) => (
              <li key={c.handle}>
                <Avatar name={c.name} hue={c.hue} />
                <div>
                  <Link href={`/personne/${c.handle}`} className="handle">@{c.handle}</Link>
                  <p className="said">{c.said}</p>
                  <p className="fact">{c.fact}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div className="intro">
            <h2>Sur ton téléphone.</h2>
            <p>Là où tu regardes vraiment tes messages.</p>
          </div>
          <dl className="honest">
            <div><dt>Installe le site</dt><dd>Ajoute AMZ Tracker à ton écran d&rsquo;accueil : il s&rsquo;ouvre comme une appli, sans passer par un store.</dd></div>
            <div><dt>Alertes</dt><dd>Active la capture automatique : tu es prévenu dès qu&rsquo;un nom disparaît, sans rien refaire à la main.</dd></div>
            <div><dt>Capture depuis le mobile</dt><dd>En préparation. Pour l&rsquo;instant, la première capture se lance depuis un ordinateur.</dd></div>
          </dl>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap split">
          <div className="intro">
            <h2>Dit franchement.</h2>
            <p>Ce que l&rsquo;outil montre, et ce qu&rsquo;il ne dit pas à ta place.</p>
          </div>
          <dl className="honest">
            <div><dt>Des faits, pas des intentions</dt><dd>Un unfollow n&rsquo;est pas une preuve de mauvaise foi. L&rsquo;outil montre la liste, c&rsquo;est toi qui tranches.</dd></div>
            <div><dt>Lecture seule</dt><dd>Il fait défiler des listes et lit des noms. Consulter une liste n&rsquo;envoie aucune notification.</dd></div>
            <div><dt>Ton compte</dt><dd>Il lit ce que ton compte a déjà le droit de voir. Aucune permission n&rsquo;est contournée.</dd></div>
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
            <h2>Fais le tri dans ta vie.</h2>
            <div className="cta">
              <Link className="btn primary" href="/dashboard">Lancer ma première capture</Link>
              <Link className="btn" href="/comparaison">Voir la liste</Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
