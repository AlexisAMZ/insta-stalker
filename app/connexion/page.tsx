import Link from "next/link";
import { InstagramMark, SnapchatMark } from "@/components/Logos";

export const metadata = { title: "Connexion — AMZ Tracker" };

export default function Page() {
  return (
    <main className="page">
      <div className="wrap login">
        <h1>Connecte ton compte.</h1>
        <p className="login-lede">
          Choisis la plateforme à trier. Tu pourras ajouter l&rsquo;autre ensuite.
        </p>
        <div className="login-buttons">
          <Link className="login-btn ig" href="/dashboard">
            <InstagramMark mono size={32} /> Continuer avec Instagram
          </Link>
          <Link className="login-btn sc" href="/dashboard">
            <SnapchatMark mono size={32} /> Continuer avec Snapchat
          </Link>
        </div>
        <p className="login-note">
          Maquette : aucun identifiant n&rsquo;est demandé ici, les boutons ouvrent simplement le tableau de bord.
        </p>
      </div>
    </main>
  );
}
