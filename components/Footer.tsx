"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const path = usePathname();
  if (path.startsWith("/acces")) return null;
  return (
    <footer className="foot">
      <div className="wrap">
        <span>AMZ Tracker · maquette, données fictives</span>
        <span className="foot-links">
          <Link href="/alertes">Alertes</Link>
          <Link href="/legal">Mentions et confidentialité</Link>
          <span>Non affilié à Instagram ni à Snapchat.</span>
        </span>
      </div>
    </footer>
  );
}
