/* ————————————————————————————————————————————————————————————————————————————
   IFT — INSTAGRAM FOLLOWERS TRACKER · interface complète (un seul collage)
   Inspiré des interfaces « scanner » plein écran, adapté à ton besoin :
   capturer abonnés + abonnements d'un compte PRIVÉ, et COMPARER avec une
   capture précédente pour voir qui est arrivé ou parti.

   Utilisation :
   1. Sur instagram.com, connectée avec TON compte (celui qui voit les listes).
   2. Place-toi sur le profil cible (ou ouvre « N abonnés » / « N abonnements »).
   3. F12 (ou ⌘+⌥+I) → onglet Console → colle TOUT ce fichier → Entrée.
      → L'interface s'ouvre par-dessus la page. Bouton « Lancer la capture » :
        elle fait défiler « abonnés », bascule seule sur « abonnements »,
        puis les deux listes apparaissent dans les onglets.
   4. Onglet « Comparaison » : charge un .txt précédent (ou colle-le) →
      la liste des arrivés et des partis depuis cette capture.
   5. Boutons « Télécharger » dans chaque onglet → fichiers pour le projet :
        ./track import <profil> ~/Downloads/abonnes_*.txt ~/Downloads/abonnements_*.txt

   ⚠️  LECTURE SEULE : le script fait défiler les listes et lit les noms.
   Il ne clique QUE sur les liens « abonnés / abonnements » du profil pour
   basculer (comme si tu cliquais toi-même). Aucun follow, like, message.

   Console : ift.stop() · ift.clear() · ift.count · ift.lignes · ift.listes
             ift.list() · ift.copy() · ift.download() · ift.fermer()
   ift.profil("nom") : forcer un autre compte (utile depuis une page qui n'est
   pas un profil) ; sinon, c'est toujours LA PAGE OÙ TU ES qui est ciblée.
   ——————————————————————————————————————————————————————————————————————————— */

(() => {
  "use strict";
  if (window.ift?.app) { window.ift.fermer(); }

  // ————— réglages capture (rythme volontairement lent, comme à la main)
  const PAUSE_MIN = 350, PAUSE_MAX = 800;
  const PAUSE_STALLE_MIN = 1200, PAUSE_STALLE_MAX = 2200;
  const MAX_TOURS_SANS_NOUVEAUTE = 6, MAX_TOURS = 6000;
  const NON_PROFILS = new Set([
    "explore", "p", "reel", "reels", "stories", "accounts", "direct", "tv",
    "about", "legal", "web", "graphql", "developer", "directory",
    "your_activity", "challenges",
  ]);

  let stop = false;
  const noms = new Set();
  const avatars = new Map();     // username -> url d'avatar
  let lignesMax = 0, type = "abonnes", dernierType = null;
  const resultats = {};          // type -> { noms: [triés], lignes, annonce }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pause = () => sleep(PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN));
  const pauseLongue = () => sleep(PAUSE_STALLE_MIN + Math.random() * (PAUSE_STALLE_MAX - PAUSE_STALLE_MIN));
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  };
  const echappe = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // profil cible : LA PAGE OÙ TU ES. Si tu es sur un profil (ou ses listes),
  // c'est lui qu'on capture — même si tu avais mémorisé un autre compte.
  // Sinon (accueil, explore, recherche…) on reprend le dernier profil suivi.
  const segment = (location.pathname.split("/").filter(Boolean)[0] || "").toLowerCase();
  const memoire = sessionStorage.getItem("ift_cible");
  let cible;
  if (segment && !NON_PROFILS.has(segment)) {
    cible = segment;
  } else if (memoire) {
    cible = memoire;
  } else {
    cible = "profil";
  }
  const motType = (t = type) => (t === "abonnements" ? "abonnements" : "abonnés");

  function detecteType(dialog) {
    const chemin = location.pathname;
    if (chemin.includes("/following/")) return "abonnements";
    if (chemin.includes("/followers/")) return "abonnes";
    // titre du panneau : premier court texte qui n'appartient pas — et ne
    // contient pas — à un onglet ou un bouton (les onglets contiennent les
    // deux mots, piège classique)
    for (const el of dialog.querySelectorAll("*")) {
      if (el.closest('[role="tab"], button, #ift-app')) continue;
      if (el.querySelector('[role="tab"], button')) continue;
      const t = (el.textContent || "").trim().toLowerCase();
      if (!t || t.length > 40) continue;
      if (/^abonnements\b|^following\b/.test(t)) return "abonnements";
      if (/^abonn[eé]s\b|^followers\b/.test(t)) return "abonnes";
    }
    return "abonnes";
  }

  function nombreAnnonce() {
    const motif = type === "abonnements"
      ? /([\d\u00a0\u202f .,']+)\s*abonnements/i
      : /([\d\u00a0\u202f .,']+)\s*abonn[eé]s/i;
    const m = (document.body.innerText || "").match(motif);
    if (!m) return null;
    const n = parseInt(m[1].replace(/[\s\u00a0\u202f.,']/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function conteneurDepuis(dialog) {
    let meilleur = null, scoreMeilleur = -1;
    for (const el of [dialog, ...dialog.querySelectorAll("*")]) {
      const oy = getComputedStyle(el).overflowY;
      if (oy !== "auto" && oy !== "scroll") continue;
      const score = el.scrollHeight - el.clientHeight;
      if (score > scoreMeilleur) { scoreMeilleur = score; meilleur = el; }
    }
    return meilleur || dialog;
  }

  function extraireDepuis(dialog) {
    for (const a of dialog.querySelectorAll('a[href]')) {
      const m = (a.getAttribute("href") || "").match(/^\/([A-Za-z0-9._]{1,30})\/?$/);
      if (!m || NON_PROFILS.has(m[1].toLowerCase())) continue;
      const u = m[1].toLowerCase();
      noms.add(u);
      const img = a.querySelector("img");
      if (img?.src) avatars.set(u, img.src);
    }
  }

  // sur son PROPRE profil, les compteurs ne sont pas des liens mais des boutons
  // (« 131 abonnés », « 251 abonnements ») : on les cherche par leur texte
  function chercheDeclencheurTexte(suffixe) {
    const motif = suffixe === "following"
      ? /\d[\d\u202f\s.,]*\s*(abonnements|following)/i
      : /\d[\d\u202f\s.,]*\s*(abonn[eé]s|followers)/i;
    return [...document.querySelectorAll('a, button, [role="button"]')].find((el) => {
      if (el.closest("#ift-app")) return false;                 // pas notre interface
      if (el.closest('div[role="dialog"]')) return false;       // pas l'intérieur du panneau
      const t = (el.innerText || "").trim().replace(/\s+/g, " ");
      return t.length <= 40 && motif.test(t);
    }) || null;
  }

  // attend que l'URL commence par un morceau de chemin
  function attendreChemin(morceau, timeoutMs = 15000) {
    const t0 = Date.now();
    return new Promise((resolu) => {
      const tick = () => {
        if (location.pathname.toLowerCase().startsWith(morceau)) return resolu(true);
        if (Date.now() - t0 > timeoutMs) return resolu(false);
        setTimeout(tick, 300);
      };
      tick();
    });
  }

  // amène le navigateur sur le profil cible, sans aide extérieure :
  // 1) on y est déjà · 2) clic sur un lien du profil présent dans la page ·
  // 3) clic sur un lien créé à la volée (le routeur d'Instagram l'intercepte
  //    et navigue sans recharger) · 4) événement popstate · 5) dernier recours,
  //    rechargement complet avec relance automatique au retour
  async function allerSurProfil(timeoutMs = 15000) {
    const racine1 = `/${cible}`;
    if (location.pathname.toLowerCase().startsWith(racine1)) return true;

    const lienProfil = [...document.querySelectorAll(`a[href^="/${cible}"]`)].find((a) => {
      const href = (a.getAttribute("href") || "").split("?")[0].replace(/\/+$/, "").toLowerCase();
      return href === racine1;
    });
    if (lienProfil) {
      lienProfil.click();
      if (await attendreChemin(racine1, timeoutMs)) return true;
    }

    const synthetique = document.createElement("a");
    synthetique.href = `${racine1}/`;
    synthetique.style.display = "none";
    document.body.appendChild(synthetique);
    synthetique.click();
    synthetique.remove();
    if (await attendreChemin(racine1, timeoutMs)) return true;

    try {
      history.pushState({}, "", `${racine1}/`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch {}
    if (await attendreChemin(racine1, timeoutMs)) return true;

    sessionStorage.setItem("ift_auto", "1");
    location.assign(`${racine1}/`);
    return false;
  }

  async function attendreListe(suffixe, timeoutMs = 20000) {
    const attendu = `/${cible}/${suffixe}`;
    let declencheur = [...document.querySelectorAll(`a[href*="/${suffixe}"]`)].find((a) => {
      const href = (a.getAttribute("href") || "").split("?")[0].replace(/\/+$/, "").toLowerCase();
      return href === attendu;
    });
    if (!declencheur) declencheur = chercheDeclencheurTexte(suffixe);
    if (!declencheur) return null;
    const contenuAvant = (() => {
      const d = [...document.querySelectorAll('div[role="dialog"]')].pop();
      return d ? [...d.querySelectorAll('a[href]')].map((a) => a.href).sort().join("|") : "";
    })();
    declencheur.click();
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs && !stop) {
      const cheminBon = location.pathname.toLowerCase().includes(`/${suffixe}/`);
      const d = [...document.querySelectorAll('div[role="dialog"]')].pop();
      if (d && d.querySelector('a[href]')) {
        if (cheminBon) return d;
        // propre profil : le chemin ne change pas. On accepte un panneau
        // nouvellement ouvert ou dont le contenu a changé après le clic.
        const contenuApres = [...d.querySelectorAll('a[href]')].map((a) => a.href).sort().join("|");
        if (!contenuAvant || contenuApres !== contenuAvant) return d;
      }
      await sleep(300);
    }
    return null;
  }

  // bascule via les onglets à l'intérieur du panneau déjà ouvert
  // (le dialogue « propre profil » d'Instagram a des onglets abonnés/abonnements)
  async function basculerDansDialog(autreSuffixe, timeoutMs = 8000) {
    const d = [...document.querySelectorAll('div[role="dialog"]')].pop();
    if (!d) return null;
    const label = autreSuffixe === "following"
      ? /abonnements|following/i
      : /abonn[eé]s|followers/i;
    const avant = [...d.querySelectorAll('a[href]')].map((a) => a.href).join(",");
    const candidats = [...d.querySelectorAll('[role="tab"], button, [role="button"]')].filter((el) => {
      const t = (el.innerText || "").trim().replace(/\s+/g, " ");
      return t.length <= 30 && label.test(t);
    });
    for (const c of candidats) {
      c.click();
      const t0 = Date.now();
      while (Date.now() - t0 < timeoutMs && !stop) {
        const apres = [...d.querySelectorAll('a[href]')].map((a) => a.href).join(",");
        if (apres !== avant) return d;
        await sleep(300);
      }
      if (stop) break;
    }
    return null;
  }

  // ————— téléchargements — nom complet : profil_liste_date_heure.txt
  const nomFichier = (t) => `${cible}_${t}_${stamp()}.txt`;
  function telechargerListe(t) {
    const r = resultats[t];
    if (!r) return toast("Rien à télécharger pour « " + motType(t) + " ».", "warning");
    telechargerFichier(r.noms.join("\n") + "\n", nomFichier(t));
    toast(`${r.noms.length} ${motType(t)} enregistrés.`, "success");
  }
  function telechargerFichier(contenu, nom) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([contenu], { type: "text/plain" }));
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // ══════════════════════════════ INTERFACE ══════════════════════════════
  const CSS = `
    #ift-app, #ift-app * { box-sizing: border-box; letter-spacing: -0.015em; }
    #ift-app { --fond:#0a0e1a; --sur:#121a2e; --sur2:#1b2440; --ligne:rgba(148,168,255,.14);
      --txt:#e9edff; --sourd:#8f97bd; --accent:#ff4d8f; --cyan:#38e1ff; --vert:#4ade80;
      --rose:#fb5e70;
      position:fixed; inset:0; z-index:2147483647; display:flex; flex-direction:column;
      background:radial-gradient(circle at 12% 0%, rgba(255,77,143,.11), transparent 38rem),
                 radial-gradient(circle at 90% 8%, rgba(56,225,255,.08), transparent 32rem),
                 var(--fond);
      color:var(--txt); font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
    #ift-app ::selection { background:rgba(255,77,143,.35); }
    #ift-app ::-webkit-scrollbar { width:9px; }
    #ift-app ::-webkit-scrollbar-thumb { background:rgba(190,200,255,.16); border-radius:5px; border:2px solid var(--fond); }
    #ift-app button { font:inherit; color:inherit; cursor:pointer; }
    #ift-app input, #ift-app select, #ift-app textarea { font:inherit; }
    #ift-app :focus-visible { outline:2px solid rgba(56,225,255,.7); outline-offset:2px; }

    .ift-tete { display:flex; align-items:center; gap:14px; min-height:62px; padding:10px 22px;
      border-bottom:1px solid var(--ligne); background:rgba(10,14,26,.86); backdrop-filter:blur(10px); }
    .ift-marque { display:flex; align-items:baseline; gap:10px; }
    .ift-marque strong { font:700 24px/1 "Avenir Next","Futura","Trebuchet MS",sans-serif; letter-spacing:-0.02em; }
    .ift-marque strong em { font-style:normal; color:var(--accent); }
    .ift-marque span { color:var(--sourd); font-size:13px; }
    .ift-puces { display:flex; gap:8px; margin-left:auto; flex-wrap:wrap; }
    .ift-puce { display:flex; align-items:center; gap:7px; min-height:32px; padding:4px 12px;
      border:1px solid var(--ligne); border-radius:8px; background:rgba(190,200,255,.04);
      font-size:13px; color:var(--sourd); font-variant-numeric:tabular-nums; }
    .ift-puce b { color:var(--txt); font-weight:650; }
    .ift-puce .point { width:8px; height:8px; border-radius:50%; background:var(--sourd); }
    .ift-puce.ok .point { background:var(--vert); }
    .ift-puce.rose .point { background:var(--rose); }
    #ift-fermer { display:flex; align-items:center; justify-content:center; width:38px; height:38px;
      border:1px solid var(--ligne); border-radius:8px; background:rgba(190,200,255,.04); }
    #ift-fermer:hover { border-color:rgba(251,94,112,.5); background:rgba(251,94,112,.1); }
    #ift-fermer svg { width:16px; height:16px; stroke:var(--txt); }

    .ift-corps { flex:1; display:grid; grid-template-columns:300px minmax(0,1fr); min-height:0; }
    .ift-cote { border-right:1px solid var(--ligne); padding:20px 18px; overflow-y:auto;
      display:flex; flex-direction:column; gap:18px; background:rgba(190,200,255,.02); }
    .ift-cote h3 { margin:0; font:650 12px/1 system-ui,sans-serif; text-transform:uppercase;
      letter-spacing:.08em; color:var(--sourd); }
    #ift-scan { width:100%; display:flex; align-items:center; justify-content:center; gap:10px;
      min-height:52px; border:1px solid rgba(255,77,143,.5); border-radius:10px;
      background:var(--accent); color:#0a0e1a; font-weight:750; font-size:15px;
      box-shadow:0 14px 34px rgba(255,77,143,.18); transition:background .15s ease, transform .15s ease; }
    #ift-scan:hover:not(:disabled) { background:#ff6ba0; transform:translateY(-1px); }
    #ift-scan:disabled { opacity:.45; cursor:default; transform:none; }
    #ift-scan svg { width:17px; height:17px; stroke:#0a0e1a; }
    .ift-bloc { display:flex; flex-direction:column; gap:8px; }
    .ift-mesure { display:flex; justify-content:space-between; align-items:center; gap:10px;
      min-height:40px; padding:8px 12px; border:1px solid var(--ligne); border-radius:9px;
      background:rgba(190,200,255,.035); font-size:13.5px; }
    .ift-mesure span { color:var(--sourd); }
    .ift-mesure b { font-variant-numeric:tabular-nums; font-weight:650; }
    .ift-chemin { margin-top:auto; padding-top:14px; border-top:1px solid var(--ligne);
      color:var(--sourd); font-size:12px; line-height:1.6; }
    .ift-chemin code { font:12px ui-monospace,Menlo,monospace; color:var(--cyan); word-break:break-all; }

    .ift-avance { position:relative; height:5px; border-radius:3px; overflow:hidden;
      background:rgba(190,200,255,.08); }
    .ift-avance i { position:absolute; inset:0; width:var(--ift-prog,0%); border-radius:3px;
      background:linear-gradient(90deg,var(--accent),var(--cyan));
      transition:width .3s cubic-bezier(.4,0,.2,1); }
    .ift-statut { font-size:13px; color:var(--sourd); min-height:20px; }
    .ift-statut b { color:var(--txt); }

    .ift-onglets { display:flex; gap:8px; padding:14px 22px 0; }
    .ift-onglet { min-height:40px; padding:8px 16px; border:1px solid var(--ligne); border-radius:9px;
      background:rgba(190,200,255,.035); color:var(--sourd); font-weight:650; font-size:14px;
      font-variant-numeric:tabular-nums; transition:background .15s ease, color .15s ease; }
    .ift-onglet:hover { color:var(--txt); }
    .ift-onglet.actif { background:rgba(255,77,143,.13); border-color:rgba(255,77,143,.45); color:var(--txt); }

    .ift-vue { flex:1; min-height:0; overflow-y:auto; padding:18px 22px 30px; }
    .ift-outils { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
    .ift-recherche { flex:1; min-width:180px; max-width:380px; min-height:40px; padding:8px 14px;
      border:1px solid var(--ligne); border-radius:9px; background:rgba(0,0,0,.28); color:var(--txt); }
    .ift-recherche::placeholder { color:rgba(168,159,143,.75); }
    .ift-bouton { display:inline-flex; align-items:center; gap:8px; min-height:40px; padding:8px 14px;
      border:1px solid var(--ligne); border-radius:9px; background:rgba(190,200,255,.05);
      font-weight:650; font-size:13.5px; transition:background .15s ease, border-color .15s ease; }
    .ift-bouton:hover { background:rgba(255,77,143,.12); border-color:rgba(255,77,143,.4); }
    .ift-bouton svg { width:15px; height:15px; stroke:var(--cyan); }

    .ift-vide { display:flex; flex-direction:column; align-items:center; gap:12px;
      padding:72px 24px; text-align:center; color:var(--sourd); }
    .ift-vide svg { width:44px; height:44px; stroke:rgba(190,200,255,.25); }
    .ift-vide p { margin:0; max-width:34rem; font-size:14.5px; }

    .ift-lignes { display:flex; flex-direction:column; gap:6px; }
    .ift-ligne { display:flex; align-items:center; gap:13px; padding:9px 12px;
      border:1px solid var(--ligne); border-radius:10px; background:rgba(190,200,255,.035); }
    .ift-ligne:hover { background:rgba(190,200,255,.065); }
    .ift-avatar { width:40px; height:40px; border-radius:10px; object-fit:cover;
      border:1px solid var(--ligne); background:var(--sur2); flex:none; }
    .ift-rang { display:flex; align-items:center; justify-content:center; width:40px; height:40px;
      border-radius:10px; border:1px solid var(--ligne); background:var(--sur2);
      font:650 16px "Avenir Next","Futura","Trebuchet MS",sans-serif; color:var(--accent); flex:none; text-transform:uppercase; }
    .ift-ligne a { color:var(--txt); font-weight:600; text-decoration:none; font-size:14.5px; }
    .ift-ligne a:hover { color:var(--cyan); text-decoration:underline; text-underline-offset:3px; }
    .ift-ligne small { color:var(--sourd); font-size:12.5px; margin-left:auto; font-variant-numeric:tabular-nums; }

    .ift-compar { display:flex; flex-direction:column; gap:16px; max-width:760px; }
    .ift-compar .ift-bloc select, .ift-compar textarea { width:100%; min-height:40px; padding:8px 12px;
      border:1px solid var(--ligne); border-radius:9px; background:rgba(0,0,0,.28); color:var(--txt); }
    .ift-compar textarea { min-height:110px; resize:vertical; }
    .ift-compar label { color:var(--sourd); font-size:13px; }
    .ift-compar .rangee { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
    .ift-bilan { display:flex; gap:10px; flex-wrap:wrap; }
    .ift-bilan .ift-puce { font-size:14px; }
    .ift-groupe h4 { margin:18px 0 8px; font-size:14px; font-weight:700; }
    .ift-groupe.vert h4 { color:var(--vert); }
    .ift-groupe.rose h4 { color:var(--rose); }

    .ift-toast { position:fixed; right:18px; bottom:18px; z-index:2147483647; max-width:340px;
      padding:12px 16px; border-radius:10px; border:1px solid var(--ligne);
      background:#e9edff; color:#0a0e1a; font:14px/1.45 system-ui,sans-serif; font-weight:550;
      box-shadow:0 18px 44px rgba(0,0,0,.4); animation:ift-entree .25s cubic-bezier(.2,.8,.3,1); }
    .ift-toast.succes { border-color:rgba(74,222,128,.6); }
    .ift-toast.erreur { border-color:rgba(251,94,112,.6); }
    @keyframes ift-entree { from { opacity:0; transform:translateY(10px); filter:blur(3px); }
      to { opacity:1; transform:none; filter:none; } }

    .ift-heros { padding:16px 14px; border:1px solid rgba(255,77,143,.32); border-radius:12px;
      background:linear-gradient(180deg, rgba(255,77,143,.12), rgba(255,77,143,.04));
      box-shadow:0 16px 40px rgba(0,0,0,.22); text-align:center; }
    .ift-heros b { display:block; font:700 46px/1 "Avenir Next","Futura","Trebuchet MS",sans-serif;
      font-variant-numeric:tabular-nums; letter-spacing:-0.02em; }
    .ift-heros span { color:var(--sourd); font-size:11.5px; text-transform:uppercase;
      letter-spacing:.07em; font-weight:650; }
    .ift-heros-note { display:block; margin-top:8px; color:var(--sourd); font-size:12px; }
    .ift-point-vivant { display:inline-block; width:8px; height:8px; border-radius:50%;
      background:var(--vert); box-shadow:0 0 0 0 rgba(74,222,128,.5);
      animation:ift-vivant 1.6s ease-out infinite; }
    @keyframes ift-vivant { 0% { box-shadow:0 0 0 0 rgba(74,222,128,.45); }
      70% { box-shadow:0 0 0 9px rgba(74,222,128,0); } 100% { box-shadow:0 0 0 0 rgba(74,222,128,0); } }
    .ift-flux { display:flex; flex-direction:column; gap:6px; max-height:300px; overflow-y:auto; }
    .ift-flux-item { display:flex; align-items:center; gap:8px; padding:6px 9px;
      border:1px solid var(--ligne); border-radius:9px; background:rgba(190,200,255,.035);
      font-size:12.5px; animation:ift-arrivee .35s cubic-bezier(.2,.8,.3,1); }
    .ift-flux-item img { width:24px; height:24px; border-radius:7px; object-fit:cover;
      border:1px solid var(--ligne); flex:none; }
    .ift-flux-item span { font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .ift-flux-item small { margin-left:auto; flex:none; color:var(--sourd); font-size:10px;
      text-transform:uppercase; letter-spacing:.06em; font-weight:700; }
    .ift-flux-item.badge-abonnements small { color:var(--cyan); }
    .ift-flux-item.badge-abonnes small { color:var(--accent); }
    @keyframes ift-arrivee { from { opacity:0; transform:translateY(-7px); filter:blur(2px); }
      to { opacity:1; transform:none; filter:none; } }

    @media (max-width: 860px) {
      .ift-corps { grid-template-columns:1fr; }
      .ift-cote { border-right:0; border-bottom:1px solid var(--ligne); }
      .ift-onglets { flex-wrap:wrap; }
      .ift-marque span { display:none; }
    }
  `;

  const icone = {
    fermer: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    scan: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    copier: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    fichier: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    radar: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
    balance: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M4 7h16"/><path d="M7 7l-3 6a3 3 0 0 0 6 0zM17 7l-3 6a3 3 0 0 0 6 0z"/></svg>',
  };

  const racine = document.createElement("div");
  racine.id = "ift-app";
  racine.innerHTML = `<style>${CSS}</style>
    <div class="ift-tete">
      <div class="ift-marque"><strong>I<em>FT</em></strong><span>@${echappe(cible)} — suivi d'abonnés, lecture seule</span></div>
      <div class="ift-puces" id="ift-puces"></div>
      <button id="ift-fermer" title="Fermer (les données restent dans ift.listes)" aria-label="Fermer">${icone.fermer}</button>
    </div>
    <div class="ift-corps">
      <aside class="ift-cote">
        <div class="ift-heros">
          <b id="ift-hero">—</b>
          <span id="ift-hero-label">comptes capturés</span>
          <div class="ift-avance" style="margin-top:10px"><i id="ift-prog2"></i></div>
          <span class="ift-heros-note" id="ift-hero-note">aucune liste en cours</span>
        </div>
        <div class="ift-bloc">
          <h3>Capture</h3>
          <button id="ift-scan">${icone.scan} Lancer la capture</button>
          <div class="ift-avance"><i id="ift-prog"></i></div>
          <div class="ift-statut" id="ift-statut">Prête. La capture enchaîne abonnés puis abonnements.</div>
        </div>
        <div class="ift-bloc">
          <h3>Lecture</h3>
          <div class="ift-mesure"><span>Noms lus</span><b id="ift-m-noms">—</b></div>
          <div class="ift-mesure"><span>Lignes au total</span><b id="ift-m-lignes">—</b></div>
          <div class="ift-mesure"><span>Annoncé par le profil</span><b id="ift-m-annonce">—</b></div>
        </div>
        <div class="ift-bloc" id="ift-flux-bloc" style="display:none">
          <h3><span class="ift-point-vivant"></span> Comptes en direct</h3>
          <div class="ift-flux" id="ift-flux"></div>
        </div>
        <div class="ift-chemin">
          Une fois les fichiers téléchargés, dans le projet :<br>
          <code>./track import profil ~/Downloads/*_abonnes_*.txt *_abonnements_*.txt</code><br>
          puis <code>./track historique profil</code>
        </div>
      </aside>
      <main style="display:flex;flex-direction:column;min-height:0">
        <nav class="ift-onglets" id="ift-onglets"></nav>
        <div class="ift-vue" id="ift-vue"></div>
      </main>
    </div>`;
  document.body.appendChild(racine);
  const scrollAvant = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const $ = (sel) => racine.querySelector(sel);
  const vue = $("#ift-vue"), ongletsEl = $("#ift-onglets");

  let toastEl = null;
  function toast(message, genre = "") {
    toastEl?.remove();
    toastEl = document.createElement("div");
    toastEl.className = `ift-toast ${genre}`;
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl?.remove(), 4200);
  }

  function puces() {
    const c = $("#ift-puces");
    c.innerHTML = Object.keys(resultats).length
      ? Object.entries(resultats).map(([t, r]) =>
          `<span class="ift-puce ${r.annonce && r.noms.length < r.annonce && r.lignes < r.annonce ? "rose" : "ok"}">
            <span class="point"></span>${motType(t)} <b>${r.noms.length}</b>${r.annonce ? `<span>/${r.annonce}</span>` : ""}</span>`
        ).join("")
      : `<span class="ift-puce"><span class="point"></span>Aucune capture</span>`;
  }

  // ————— onglets & vues
  const onglets = [
    { id: "abonnes", titre: () => `Abonnés${resultats.abonnes ? ` · ${resultats.abonnes.noms.length}` : ""}` },
    { id: "abonnements", titre: () => `Abonnements${resultats.abonnements ? ` · ${resultats.abonnements.noms.length}` : ""}` },
    { id: "comparaison", titre: () => "Comparaison" },
  ];
  let ongletActif = "abonnes";

  function renduOnglets() {
    ongletsEl.innerHTML = "";
    for (const o of onglets) {
      const b = document.createElement("button");
      b.className = "ift-onglet" + (o.id === ongletActif ? " actif" : "");
      b.textContent = o.titre();
      b.onclick = () => { ongletActif = o.id; renduOnglets(); renduVue(); };
      ongletsEl.appendChild(b);
    }
  }

  function listeHTML(t, filtre = "") {
    const r = resultats[t];
    if (!r) return "";
    const f = filtre.trim().toLowerCase();
    const visibles = f ? r.noms.filter((n) => n.includes(f)) : r.noms;
    return `<div class="ift-lignes">` + visibles.map((u) => {
      const av = avatars.get(u);
      const vis = `<img class="ift-avatar" src="${echappe(av)}" alt="" onerror="this.outerHTML='<span class=\\'ift-rang\\'>${echappe(u[0])}</span>'">`;
      return `<div class="ift-ligne">${av ? vis : `<span class="ift-rang">${echappe(u[0])}</span>`}
        <a href="https://instagram.com/${echappe(u)}/" target="_blank" rel="noopener noreferrer">@${echappe(u)}</a>
        <small>profil</small></div>`;
    }).join("") + `</div>`;
  }

  function vueListe(t) {
    const r = resultats[t];
    if (!r) {
      return `<div class="ift-vide">${icone.radar}<p>Aucune capture pour l'instant.
        Lance « Lancer la capture » à gauche : le script défile « abonnés », bascule
        tout seul sur « abonnements », et les deux listes arrivent ici.</p></div>`;
    }
    return `<div class="ift-outils">
        <input class="ift-recherche" type="search" placeholder="Filtrer un @…" aria-label="Filtrer">
        <button class="ift-bouton" data-action="copier" data-type="${t}">${icone.copier} Copier</button>
        <button class="ift-bouton" data-action="dl" data-type="${t}">${icone.fichier} Télécharger</button>
      </div>
      <div class="ift-statut" style="margin-bottom:12px">${r.noms.length} ${motType(t)}${r.annonce ? ` sur ${r.annonce} annoncés` : ""}${r.sansNom ? ` · ${r.sansNom} ligne${r.sansNom > 1 ? "s" : ""} sans nom (comptes supprimés/désactivés)` : ""}</div>
      <div id="ift-resultat">${listeHTML(t)}</div>`;
  }

  let reference = null;   // { type, noms:Set, source }
  function vueComparaison() {
    const typesDispo = `<select id="ift-c-type">
        <option value="abonnes">Abonnés</option>
        <option value="abonnements">Abonnements</option>
      </select>`;
    return `<div class="ift-compar">
      <div class="ift-bloc">
        <h3>Comparer à une capture précédente</h3>
        <label>Liste concernée</label>
        ${typesDispo}
      </div>
      <div class="ift-bloc">
        <label>Fichier .txt d'une capture précédente (bouton « Télécharger » du jour J)</label>
        <div class="rangee">
          <button class="ift-bouton" id="ift-c-fichier">${icone.fichier} Choisir un fichier…</button>
          <input type="file" id="ift-c-input" accept=".txt,text/plain" style="display:none">
          <span class="ift-statut" id="ift-c-nomfichier"></span>
        </div>
      </div>
      <div class="ift-bloc">
        <label>… ou colle-la ici (un @ par ligne)</label>
        <textarea id="ift-c-texte" placeholder="@compte1&#10;@compte2&#10;…"></textarea>
      </div>
      <div class="rangee">
        <button class="ift-bouton" id="ift-c-go" style="border-color:rgba(255,77,143,.5);background:rgba(255,77,143,.14)">Comparer</button>
        <span class="ift-statut" id="ift-c-message"></span>
      </div>
      <div id="ift-c-resultat"></div>
    </div>`;
  }

  function renduComparaison() {
    const res = $("#ift-c-resultat");
    const t = $("#ift-c-type").value;
    const actuelle = resultats[t];
    if (!reference) { res.innerHTML = ""; return; }
    if (!actuelle) {
      res.innerHTML = `<div class="ift-vide">${icone.balance}<p>Lance d'abord une capture
        (onglet ${motType(t)}), puis compare-la ici à ta référence.</p></div>`;
      return;
    }
    const refs = reference.noms;
    if (reference.type !== t) {
      res.innerHTML = `<div class="ift-vide"><p>La référence chargée concerne
        <b>${motType(reference.type)}</b>, pas ${motType(t)}.</p></div>`;
      return;
    }
    const arrives = actuelle.noms.filter((u) => !refs.has(u));
    const partis = [...refs].filter((u) => !actuelle.noms.includes(u));
    const lignesDe = (liste, genre) => `<div class="ift-groupe ${genre}">
        <h4>${genre === "vert" ? "+" : "−"} ${liste.length} compte${liste.length > 1 ? "s" : ""}</h4>
        <div class="ift-lignes">` + liste.map((u) => {
          const av = avatars.get(u);
          return `<div class="ift-ligne">${av ? `<img class="ift-avatar" src="${echappe(av)}" alt="" onerror="this.style.visibility='hidden'">` : `<span class="ift-rang">${echappe(u[0])}</span>`}
            <a href="https://instagram.com/${echappe(u)}/" target="_blank" rel="noopener noreferrer">@${echappe(u)}</a></div>`;
        }).join("") + `</div></div>`;
    res.innerHTML = `
      <div class="ift-bilan">
        <span class="ift-puce ok"><span class="point"></span>Arrivés depuis la référence <b>+${arrives.length}</b></span>
        <span class="ift-puce rose"><span class="point"></span>Partis depuis la référence <b>−${partis.length}</b></span>
        <span class="ift-puce"><span class="point"></span>Net <b>${arrives.length - partis.length >= 0 ? "+" : ""}${arrives.length - partis.length}</b></span>
        <span class="ift-puce"><span class="point"></span>Avant <b>${refs.size}</b> → Après <b>${actuelle.noms.length}</b></span>
      </div>
      ${arrives.length ? lignesDe(arrives, "vert") : ""}
      ${partis.length ? lignesDe(partis, "rose") : ""}
      ${!arrives.length && !partis.length ? `<div class="ift-vide"><p>Aucun changement depuis la référence.</p></div>` : ""}
      <div class="rangee" style="margin-top:14px">
        <button class="ift-bouton" id="ift-c-rapport">${icone.fichier} Télécharger le rapport</button>
      </div>`;
    $("#ift-c-rapport").onclick = () => {
      const l = [
        `Comparaison des ${motType(t)} de @${cible}`,
        `Référence : ${reference.source} — ${refs.size}`,
        `Capture du ${stamp().replace("_", " à ").replace(/(\d{2})(\d{2})(\d{2})$/, "$1:$2:$3")} — ${actuelle.noms.length}`,
        `Arrivés : +${arrives.length}   Partis : -${partis.length}`,
        "",
      ];
      if (arrives.length) l.push("+ Arrivés :", ...arrives.map((u) => "  +" + u), "");
      if (partis.length) l.push("- Partis :", ...partis.map((u) => "  -" + u), "");
      if (!arrives.length && !partis.length) l.push("Aucun changement.");
      telechargerFichier(l.join("\n"), `comparaison_${cible}_${t}_${stamp()}.txt`);
    };
  }

  function renduVue() {
    if (ongletActif === "comparaison") { vue.innerHTML = vueComparaison(); brancherComparaison(); return; }
    const t = ongletActif;
    vue.innerHTML = vueListe(t);
    const champ = vue.querySelector(".ift-recherche");
    champ?.addEventListener("input", () => {
      $("#ift-resultat").innerHTML = listeHTML(t, champ.value);
    });
    vue.querySelectorAll("[data-action]").forEach((b) => {
      b.onclick = () => {
        const r = resultats[b.dataset.type];
        if (!r) return;
        if (b.dataset.action === "copier") {
          navigator.clipboard.writeText(r.noms.join("\n")).then(() => toast(`${r.noms.length} ${motType(b.dataset.type)} copiés.`, "succes"));
        } else telechargerListe(b.dataset.type);
      };
    });
  }

  function brancherComparaison() {
    $("#ift-c-fichier").onclick = () => $("#ift-c-input").click();
    $("#ift-c-input").onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const texte = await f.text();
      chargerReference(texte, f.name);
    };
    $("#ift-c-go").onclick = () => {
      const texte = $("#ift-c-texte").value;
      if (texte.trim()) chargerReference(texte, "texte collé");
      const refs = reference?.noms;
      if (!refs) { $("#ift-c-message").textContent = "Charge d'abord une référence (fichier ou texte)."; return; }
      $("#ift-c-message").textContent = `Référence : ${refs.size} comptes (${motType(reference.type)}).`;
      renduComparaison();
    };
  }

  function chargerReference(texte, source) {
    const noms2 = new Set();
    for (const ligne of texte.split(/\r?\n/)) {
      const l = ligne.trim();
      if (l && !l.startsWith("#")) noms2.add(l.replace(/^@/, "").toLowerCase());
    }
    if (!noms2.size) { toast("Aucun @ trouvé dans cette référence.", "erreur"); return; }
    const m = source.match(/abonnements|following/i);
    const type2 = m ? "abonnements" : "abonnes";
    reference = { type: type2, noms: noms2, source };
    $("#ift-c-type").value = type2;
    const nf = $("#ift-c-nomfichier");
    if (nf) nf.textContent = `${source} — ${noms2.size} comptes (${motType(type2)})`;
    renduComparaison();
    toast(`Référence chargée : ${noms2.size} ${motType(type2)}.`, "succes");
  }

  // —— flux « en direct » : les comptes apparaissent au fil du défilement
  function fluxAjouter(usagers, t) {
    $("#ift-flux-bloc").style.display = "";
    const flux = $("#ift-flux");
    for (const u of usagers.slice(-8).reverse()) {   // les plus récents en haut
      const item = document.createElement("div");
      item.className = "ift-flux-item badge-" + t;
      const av = avatars.get(u);
      item.innerHTML =
        (av ? `<img src="${echappe(av)}" alt="" onerror="this.remove()">`
            : `<span class="ift-rang" style="width:24px;height:24px;font-size:11px;border-radius:7px">${echappe(u[0])}</span>`) +
        `<span>@${echappe(u)}</span><small>${t === "abonnements" ? "abo." : "ab."}</small>`;
      flux.prepend(item);
    }
    while (flux.children.length > 24) flux.lastChild.remove();
  }

  // ————— capture
  async function capturer(dialog) {
    noms.clear();
    lignesMax = 0;
    const vusCetteCapture = new Set();
    type = detecteType(dialog);
    dernierType = type;
    const conteneur = conteneurDepuis(dialog);
    const attendu = nombreAnnonce();
    extraireDepuis(dialog);
    const statut = $("#ift-statut");
    const maj = (txt2, pct) => {
      statut.innerHTML = txt2;
      $("#ift-prog").style.setProperty("--ift-prog", pct);
      $("#ift-prog2").style.setProperty("--ift-prog", pct);
      $("#ift-m-noms").textContent = noms.size;
      $("#ift-m-lignes").textContent = lignesMax || "—";
      $("#ift-m-annonce").textContent = attendu || "—";
      $("#ift-hero").textContent = noms.size;
      $("#ift-hero-note").textContent = `${motType()}${attendu ? ` · ${noms.size}/${attendu}` : " · en cours"}`;
    };

    const pas = () => Math.max(300, Math.round((conteneur.clientHeight || 600) * 0.8));
    let sansNouveaute = 0, precedent = noms.size, tour = 0;
    while (sansNouveaute < MAX_TOURS_SANS_NOUVEAUTE && !stop && tour < MAX_TOURS) {
      tour++;
      if (sansNouveaute > 0) {
        conteneur.scrollTop = Math.max(0, conteneur.scrollTop - 300);
        conteneur.dispatchEvent(new Event("scroll", { bubbles: true }));
        await sleep(400);
        conteneur.scrollTop = conteneur.scrollHeight;
        conteneur.dispatchEvent(new Event("scroll", { bubbles: true }));
        await pauseLongue();
      } else {
        conteneur.scrollBy(0, pas());
        conteneur.dispatchEvent(new Event("scroll", { bubbles: true }));
        await pause();
      }
      extraireDepuis(dialog);
      const av = conteneur.querySelectorAll("img").length;
      if (av > lignesMax) lignesMax = av;
      // les nouveaux noms partent dans le flux « en direct »
      const nouveaux = [...noms].filter((u) => !vusCetteCapture.has(u));
      if (nouveaux.length) {
        nouveaux.forEach((u) => vusCetteCapture.add(u));
        fluxAjouter(nouveaux, type);
      }
      if (noms.size > precedent) { sansNouveaute = 0; precedent = noms.size; }
      else sansNouveaute++;
      maj(`<b>${noms.size}</b> ${motType()}${attendu ? ` / ${attendu}` : ""} — vérification ${sansNouveaute}/${MAX_TOURS_SANS_NOUVEAUTE}`,
           Math.min(99, attendu ? Math.round((noms.size / attendu) * 100) : Math.min(90, tour)));
    }

    const liste = [...noms].sort();
    resultats[type] = {
      noms: liste,
      lignes: lignesMax,
      annonce: attendu,
      sansNom: Math.max(0, lignesMax - liste.length),
      a: new Date().toISOString(),
    };

    const sansNom = resultats[type].sansNom;
    if (stop) statut.innerHTML = `Arrêté à <b>${liste.length}</b> ${motType()}.`;
    else if (attendu && liste.length < attendu && lignesMax < attendu * 0.95)
      statut.innerHTML = `⚠️ <b>${liste.length}/${attendu}</b> et ~${lignesMax} lignes — il en manque : défile à la molette jusqu'en bas puis relance.`;
    else if (attendu && liste.length < attendu)
      statut.innerHTML = `⚠️ <b>${liste.length}/${attendu}</b> — l'écart vient des comptes supprimés/désactivés (~${lignesMax} lignes). Rien n'a été raté.`;
    else
      statut.innerHTML = `${motType()} complète : <b>${liste.length}</b>${attendu ? ` / ${attendu}` : ""} ✓${sansNom ? ` (+${sansNom} sans nom)` : ""}`;
    maj(statut.innerHTML, 100);
    puces();
    renduOnglets();
    telechargerListe(type);
  }

  async function scanner() {
    if (window.ift.fin === false) return;
    stop = false;
    window.ift.fin = false;
    $("#ift-flux").innerHTML = "";
    $("#ift-flux-bloc").style.display = "none";
    $("#ift-scan").disabled = true;
    $("#ift-scan").innerHTML = `${icone.scan} Capture en cours…`;

    let dialog = [...document.querySelectorAll('div[role="dialog"]')].pop() || null;
    if (!dialog) {
      if (cible === "profil") {
        toast(`Je ne sais pas quel profil cibler : lance ift.profil("nom_du_compte") dans la console, ou place-toi sur le profil.`, "erreur");
        $("#ift-scan").disabled = false;
        $("#ift-scan").innerHTML = `${icone.scan} Lancer la capture`;
        window.ift.fin = true;
        return;
      }
      $("#ift-statut").innerHTML = `Je vais sur le profil @${cible}…`;
      const arrivee = await allerSurProfil();
      if (!arrivee) {
        // rechargement complet demandé : l'app se relancera seule au retour
        return;
      }
      dialog = await attendreListe("followers");
      if (!dialog) {
        $("#ift-statut").textContent = "Impossible d'ouvrir la liste « abonnés ».";
        toast(`Le profil @${cible} est ouvert mais la liste « abonnés » ne s'ouvre pas (privé, ou ton compte ne le suit plus ?).`, "erreur");
        $("#ift-scan").disabled = false;
        $("#ift-scan").innerHTML = `${icone.scan} Lancer la capture`;
        window.ift.fin = true;
        return;
      }
    }
    sessionStorage.setItem("ift_cible", cible);   // mémorisé pour les prochains lancements
    await capturer(dialog);

    const autre = type === "abonnements" ? "followers" : "following";
    if (!stop) {
      $("#ift-statut").innerHTML = `Passage sur « ${autre === "following" ? "abonnements" : "abonnés"} »…`;
      const d2 = await attendreListe(autre);
      const viaOnglet = d2 ? null : await basculerDansDialog(autre);
      if (d2 || viaOnglet) { await sleep(500); await capturer(d2 || viaOnglet); }
      else toast(`Impossible d'ouvrir « ${autre === "following" ? "abonnements" : "abonnés"} » tout seul : ouvre-la et relance (la capture faite est gardée).`, "warning");
    }

    window.ift.fin = true;
    $("#ift-scan").disabled = false;
    $("#ift-scan").innerHTML = `${icone.scan} Relancer la capture`;
    ongletActif = Object.keys(resultats)[0] || "abonnes";
    renduOnglets();
    renduVue();
    toast("Capture terminée — compare dans l'onglet « Comparaison ».", "succes");
  }

  // ————— API console
  window.ift = {
    app: true,
    fin: true,
    get count() { return noms.size; },
    get lignes() { return lignesMax; },
    listes: resultats,
    stop() { stop = true; console.log("🛑 IFT : arrêt demandé — données conservées."); },
    clear() {
      stop = true; noms.clear(); avatars.clear(); lignesMax = 0;
      for (const k of Object.keys(resultats)) delete resultats[k];
      reference = null;
      this.fin = false;
      puces(); renduOnglets(); renduVue();
      $("#ift-statut").textContent = "Tout effacé. Relance une capture.";
      console.log("🧹 IFT : tout est effacé.");
    },
    list() { console.log(JSON.parse(JSON.stringify(resultats))); return JSON.parse(JSON.stringify(resultats)); },
    profil(nom) {
      if (!nom) return cible;
      cible = String(nom).trim().toLowerCase().replace(/^@/, "");
      sessionStorage.setItem("ift_cible", cible);
      toast(`Cible : @${cible} — je lance la capture.`);
      scanner();
      return cible;
    },
    async copy(t) {
      const c = t || dernierType;
      const r = resultats[c];
      if (!r) return toast("Rien à copier" + (c ? ` pour « ${c} »` : "") + ".", "erreur");
      await navigator.clipboard.writeText(r.noms.join("\n"));
      toast(`${r.noms.length} ${motType(c)} copiés.`, "succes");
    },
    download(t) { t ? telechargerListe(t) : Object.keys(resultats).forEach(telechargerListe); },
    fermer() {
      racine.remove();
      document.body.style.overflow = scrollAvant;
      toastEl?.remove();
    },
    // interne (diagnostic)
    _debug: { attendreListe, basculerDansDialog, detecteType, allerSurProfil, nomFichier },
  };

  // ————— branchements
  $("#ift-scan").onclick = scanner;
  $("#ift-fermer").onclick = () => window.ift.fermer();
  const onEscape = (e) => { if (e.key === "Escape") window.ift.stop(); };
  document.addEventListener("keydown", onEscape);
  new MutationObserver(function surveille() {
    if (!document.body.contains(racine)) {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = scrollAvant;
      this.disconnect();
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  puces();
  renduOnglets();
  renduVue();
  toast("IFT prêt : « Lancer la capture » dans le panneau de gauche.", "succes");

  // retour d'un rechargement demandé par allerSurProfil : on relance seule
  if (sessionStorage.getItem("ift_auto") === "1") {
    sessionStorage.removeItem("ift_auto");
    toast(`De retour sur @${cible} — je relance la capture toute seule…`);
    scanner();
  }
})();
