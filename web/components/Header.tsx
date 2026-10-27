"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMarks } from "./Logos";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/comparaison", label: "Comparaison" },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="top">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="AMZ Tracker, accueil">
          AMZ Tracker
          <BrandMarks size={22} />
        </Link>
        <nav className="nav" aria-label="Navigation principale">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
