"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCutList } from "@/lib/cutlist";
import { BrandMarks, LogoMark } from "./Logos";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/comparaison", label: "Comparaison" },
];

export default function Header() {
  const path = usePathname();
  const { list } = useCutList();
  if (path.startsWith("/acces")) return null;
  return (
    <header className="top">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="unfollowd by AMZ, accueil">
          <LogoMark size={32} />
          unfollowd<span className="by">by AMZ</span>
          <BrandMarks size={22} />
        </Link>
        <nav className="nav" aria-label="Navigation principale">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={l.href === "/" || l.href === "/comparaison" ? "nav-minor" : undefined}
              aria-current={path === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/a-degager" aria-current={path === "/a-degager" ? "page" : undefined}>
            À dégager{list.length > 0 && <span className="count">{list.length}</span>}
          </Link>
          <Link className="nav-cta" href="/connexion" aria-current={path === "/connexion" ? "page" : undefined}>
            Se connecter
          </Link>
        </nav>
      </div>
    </header>
  );
}
