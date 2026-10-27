"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { reopenConsent } from "./Analytics";

export default function Footer() {
  const path = usePathname();
  if (path.startsWith("/acces") || path.startsWith("/bientot")) return null;
  return (
    <footer className="foot">
      <div className="wrap">
        <span>unfollowd by AMZ</span>
        <span className="foot-links">
          <Link href="/partage">Partager</Link>
          <Link href="/alertes">Alertes</Link>
          <button type="button" className="linkbtn foot-btn" onClick={reopenConsent}>Cookies</button>
          <Link href="/legal">Mentions et confidentialité</Link>
          <span>Non affilié à Instagram ni à Snapchat.</span>
        </span>
      </div>
    </footer>
  );
}
