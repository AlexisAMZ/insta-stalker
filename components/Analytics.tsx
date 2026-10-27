"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-C6PJWQ9HP8";
const KEY = "amz_consent";
const REOPEN = "amz:cookies";

type Consent = "granted" | "denied" | null;

const read = (): Consent => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

const write = (v: Exclude<Consent, null>) => {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* stockage indisponible : le choix vaut pour la session */
  }
};

/** Google Analytics, chargé uniquement après accord. Le bandeau offre « Accepter » et « Refuser » avec le même poids. */
export default function Analytics() {
  const path = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = read();
    setConsent(saved);
    setOpen(saved === null);
    setReady(true);
    const reopen = () => setOpen(true);
    window.addEventListener(REOPEN, reopen);
    return () => window.removeEventListener(REOPEN, reopen);
  }, []);

  if (!ready || path.startsWith("/acces")) return null;

  function choose(v: Exclude<Consent, null>) {
    const wasGranted = consent === "granted";
    write(v);
    setConsent(v);
    setOpen(false);
    // Retirer Analytics après un refus : on recharge pour que le script ne reste pas actif.
    if (v === "denied" && wasGranted) window.location.reload();
  }

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {open && (
        <div className="consent" role="dialog" aria-label="Cookies et mesure d'audience">
          <p>
            Avec ton accord, on mesure les visites avec Google Analytics pour savoir d&rsquo;où tu viens. Sans ton accord, rien n&rsquo;est déposé.{" "}
            <a href="/legal#audience">En savoir plus</a>
          </p>
          <div className="consent-actions">
            <button type="button" className="btn small" onClick={() => choose("denied")}>Refuser</button>
            <button type="button" className="btn small" onClick={() => choose("granted")}>Accepter</button>
          </div>
        </div>
      )}
    </>
  );
}

export const reopenConsent = () => window.dispatchEvent(new Event(REOPEN));
