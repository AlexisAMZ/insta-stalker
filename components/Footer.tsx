"use client";

import Link from "next/link";
import { reopenConsent } from "./Analytics";

export default function Footer() {
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
