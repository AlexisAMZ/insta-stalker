/* ————————————————————————————————————————————————————————————————————————————
   INSTAGRAM FOLLOWERS TRACKER — capture 100 % console, les 2 listes d'un coup
   (méthode pour les comptes PRIVÉS que ton compte a le droit de voir)

   Utilisation :
   1. Sur instagram.com, connectée avec TON compte (celui qui voit les listes).
   2. Place-toi sur le profil cible. (Tu peux aussi ouvrir directement
      « N abonnés » ou « N abonnements » : le script s'adapte.)
   3. F12 (ou ⌘+⌥+I) → onglet Console → colle TOUT ce fichier → Entrée.
      TOUT se passe dans la console, rien ne s'affiche sur la page.
      Le script capture « abonnés », bascule tout seul sur « abonnements »,
      puis télécharge les 2 fichiers .txt.
      S'il n'arrive pas à basculer : ouvre l'autre liste à la main et
      relance — chaque liste capturée reste disponible dans ift.listes.

   Commandes console, pendant ou après la capture :
      ift.stop()          arrêter (ce qui est capturé est conservé)
      ift.clear()         tout effacer (listes + console) pour repartir de zéro
      ift.count           nombre capturé (liste en cours / dernière)
      ift.lignes          lignes vues au total, comptes sans nom inclus
      ift.listes          les listes capturées { abonnes: […], abonnements: […] }
      ift.list()          afficher les listes
      ift.copy()          copier la dernière liste capturée (ou ift.copy("abonnes"))
      ift.download()      télécharger (ou ift.download("abonnements"))
   (Échap sur la page Instagram = ift.stop())

   4. Intègre les fichiers au projet :
        ./track import <profil> ~/Downloads/abonnes_*.txt ~/Downloads/abonnements_*.txt
      puis, dans quelques jours, refais une capture et :
        ./track historique <profil>          ← évolution des deux listes
        ./track compare <profil>             ← détail arrivées/départs
        ./track compare <profil> --type abonnements

   ⚠️  LECTURE SEULE : le script fait défiler les listes et lit les noms
   affichés. Il ne clique QUE sur les liens « abonnés / abonnements » du profil
   pour basculer de l'une à l'autre (pareil que si tu cliquais toi-même).
   Aucun follow, aucun like, aucun message, aucune notification envoyée.

   Notes :
   - À la fin de chaque liste, le script compare au nombre annoncé par le
     profil et compte les lignes « sans nom » : ce sont des comptes
     supprimés/désactivés, comptés par le profil mais invisibles.
   - Si le 2e fichier n'arrive pas dans Téléchargements (Chrome demande parfois
     confirmation pour les téléchargements multiples), autorise-le ou lance
     ift.download("abonnements").
   ——————————————————————————————————————————————————————————————————————————— */

(() => {
  "use strict";

  // —— réglages (rythme volontairement lent, comme un défilement à la main)
  const TELECHARGER_AUTO = true;            // télécharger chaque liste dès qu'elle est finie
  const PAUSE_MIN = 350;                    // ms entre deux défilements
  const PAUSE_MAX = 800;
  const PAUSE_STALLE_MIN = 1200;            // ms quand plus rien ne charge :
  const PAUSE_STALLE_MAX = 2200;            //   on laisse Instagram souffler
  const MAX_TOURS_SANS_NOUVEAUTE = 6;       // tours sans rien de nouveau avant d'arrêter
  const MAX_TOURS = 6000;                   // garde-fou anti-boucle infinie
  const LOG_EVERY_MS = 2000;                // cadence des lignes de progression
  const NON_PROFILS = new Set([
    "explore", "p", "reel", "reels", "stories", "accounts", "direct", "tv",
    "about", "legal", "web", "graphql", "developer", "directory",
    "your_activity", "challenges",
  ]);

  let stop = false;
  const noms = new Set();
  let lignesMax = 0;      // nb max de lignes vues (avatars), comptes sans nom inclus
  let type = "abonnes";   // liste en cours
  let dernierType = null;
  const resultats = {};   // type -> liste triée
  const txt = () => [...noms].sort().join("\n");

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pause = () => sleep(PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN));
  const pauseLongue = () => sleep(PAUSE_STALLE_MIN + Math.random() * (PAUSE_STALLE_MAX - PAUSE_STALLE_MIN));
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
           `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  };

  // profil cible déduit de l'URL : instagram.com/<profil>/…
  const cible = (location.pathname.split("/").filter(Boolean)[0] || "profil").toLowerCase();

  // type de liste : « abonnes » (ceux qui suivent le profil) ou
  // « abonnements » (ceux que le profil suit) — déduit de l'URL,
  // sinon du titre du panneau ouvert
  const motType = () => (type === "abonnements" ? "abonnements" : "abonnés");
  function detecteType(dialog) {
    const chemin = location.pathname;
    if (chemin.includes("/following/")) return "abonnements";
    if (chemin.includes("/followers/")) return "abonnes";
    const texte = (dialog.innerText || "").toLowerCase();
    if (texte.includes("abonnements")) return "abonnements";
    return "abonnes";
  }

  // nombre annoncé par le profil (boutons « 131 abonnés · 251 abonnements »)
  function nombreAnnonce() {
    const motif = type === "abonnements"
      ? /([\d\u00a0\u202f .,']+)\s*abonnements/i
      : /([\d\u00a0\u202f .,']+)\s*abonn[eé]s/i;
    const m = (document.body.innerText || "").match(motif);
    if (!m) return null;
    const n = parseInt(m[1].replace(/[\s\u00a0\u202f.,']/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function telecharger(t) {
    const liste = resultats[t];
    if (!liste || !liste.length) {
      console.warn(`IFT : rien à télécharger pour « ${t} ».`);
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([liste.join("\n") + "\n"], { type: "text/plain" }));
    a.download = `${t}_${stamp()}.txt`;   // convention reconnue par ./track import
    document.body.appendChild(a);
    a.click();
    a.remove();
    console.log(`💾 IFT : ${liste.length} ${t === "abonnements" ? "abonnements" : "abonnés"} → fichier téléchargé (si rien n'arrive : ift.download("${t}")).`);
  }

  // —— API console : ift.stop() / ift.clear() / ift.listes / …
  window.ift = {
    fin: true,
    get count() { return noms.size; },
    get lignes() { return lignesMax; },
    listes: resultats,
    stop() {
      stop = true;
      console.log(`🛑 IFT : arrêt demandé — données conservées (ift.list(), ift.download()).`);
    },
    clear() {
      stop = true;
      noms.clear();
      lignesMax = 0;
      for (const k of Object.keys(resultats)) delete resultats[k];
      this.fin = false;
      try { console.clear(); } catch {}
      console.log("🧹 IFT : tout est effacé (listes + console). Colle à nouveau le script pour relancer.");
    },
    list() {
      for (const [t, liste] of Object.entries(resultats)) {
        console.log(`IFT — ${t} (${liste.length}) :\n${liste.join("\n")}`);
      }
      if (!Object.keys(resultats).length) console.log("IFT : aucune liste capturée pour l'instant.");
      return JSON.parse(JSON.stringify(resultats));
    },
    async copy(t) {
      const cible2 = t || dernierType;
      const liste = resultats[cible2];
      if (!liste) { console.warn(`IFT : pas de liste « ${cible2} ».`); return; }
      await navigator.clipboard.writeText(liste.join("\n"));
      console.log(`📋 IFT : « ${cible2} » copiée (${liste.length}).`);
    },
    download(t) {
      if (t) { telecharger(t); return; }
      for (const k of Object.keys(resultats)) telecharger(k);
    },
  };

  // —— trouve la zone qui défile à l'intérieur du panneau « abonnés »
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

  // —— lit les noms visibles dans le panneau
  function extraireDepuis(dialog) {
    for (const a of dialog.querySelectorAll('a[href]')) {
      const m = (a.getAttribute("href") || "").match(/^\/([A-Za-z0-9._]{1,30})\/?$/);
      if (m && !NON_PROFILS.has(m[1].toLowerCase())) noms.add(m[1].toLowerCase());
    }
  }

  // clique sur le lien « abonnés / abonnements » du profil et attend le panneau
  async function attendreListe(suffixe, timeoutMs = 20000) {
    const attendu = `/${cible}/${suffixe}`;
    const btn = [...document.querySelectorAll(`a[href*="/${suffixe}"]`)].find((a) => {
      const href = (a.getAttribute("href") || "").split("?")[0].replace(/\/+$/, "").toLowerCase();
      return href === attendu;
    });
    if (!btn) return null;
    btn.click();
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs && !stop) {
      if (location.pathname.toLowerCase().includes(`/${suffixe}/`)) {
        const d = [...document.querySelectorAll('div[role="dialog"]')].pop();
        if (d && d.querySelector('a[href]')) return d;
      }
      await sleep(300);
    }
    return null;
  }

  // —— capture complète d'une liste ouverte
  async function capturer(dialog) {
    noms.clear();
    lignesMax = 0;
    type = detecteType(dialog);
    dernierType = type;
    const conteneur = conteneurDepuis(dialog);
    const attendu = nombreAnnonce();
    const annonce = attendu ? ` / ${attendu} annoncés` : "";
    extraireDepuis(dialog);
    console.log(`▶️ IFT : capture des ${motType()} de @${cible}${annonce}… (ift.stop() pour arrêter)`);

    const pas = () => Math.max(300, Math.round((conteneur.clientHeight || 600) * 0.8));
    let sansNouveaute = 0, precedent = noms.size, tour = 0, dernierLog = 0;
    while (sansNouveaute < MAX_TOURS_SANS_NOUVEAUTE && !stop && tour < MAX_TOURS) {
      tour++;
      if (sansNouveaute > 0) {
        // rien de nouveau : à-coup haut-bas pour relancer le chargement,
        // puis longue pause — Instagram charge par paquets, parfois lentement
        conteneur.scrollTop = Math.max(0, conteneur.scrollTop - 300);
        conteneur.dispatchEvent(new Event("scroll", { bubbles: true }));
        await sleep(400);
        conteneur.scrollTop = conteneur.scrollHeight;
        conteneur.dispatchEvent(new Event("scroll", { bubbles: true }));
        await pauseLongue();
      } else {
        // défilement progressif (et non un saut en bas) pour qu'Instagram
        // ait le temps de construire toutes les lignes intermédiaires
        conteneur.scrollBy(0, pas());
        conteneur.dispatchEvent(new Event("scroll", { bubbles: true }));
        await pause();
      }
      extraireDepuis(dialog);
      // chaque ligne (nommée ou non) porte un avatar : proxy du total réel
      const avatars = conteneur.querySelectorAll("img").length;
      if (avatars > lignesMax) lignesMax = avatars;
      if (noms.size > precedent) { sansNouveaute = 0; precedent = noms.size; }
      else sansNouveaute++;
      if (Date.now() - dernierLog > LOG_EVERY_MS) {
        dernierLog = Date.now();
        console.log(`IFT · ${noms.size} ${motType()}${annonce}…`);
      }
    }

    resultats[type] = [...noms].sort();

    // bilan de la liste
    const sansNom = Math.max(0, lignesMax - noms.size);
    const noteSansNom = sansNom > 0
      ? ` (+${sansNom} ligne${sansNom > 1 ? "s" : ""} sans nom = comptes supprimés/désactivés)`
      : "";
    if (stop) {
      console.warn(`🛑 IFT : arrêté à ${noms.size} ${motType()}${annonce}.`);
    } else if (attendu && noms.size < attendu && lignesMax < attendu * 0.95) {
      console.warn(`⚠️ IFT : ${noms.size}/${attendu} ${motType()} et seulement ~${lignesMax} lignes chargées — il en manque ! Défile à la molette jusqu'en bas du panneau puis relance le script.`);
    } else if (attendu && noms.size < attendu) {
      console.warn(`⚠️ IFT : ${noms.size}/${attendu} ${motType()}, mais ~${lignesMax} lignes dans la liste : l'écart vient des comptes supprimés/désactivés. Rien n'a été raté.`);
    } else {
      console.log(`✅ IFT : ${motType()} — ${noms.size}${attendu ? ` (comme les ${attendu} annoncés)` : ""} ✓${noteSansNom}`);
    }
    console.log(`IFT → ${noms.size} noms lus, ~${lignesMax} lignes au total${noteSansNom}`);
    if (TELECHARGER_AUTO) telecharger(type);
  }

  async function main() {
    const dialogs = [...document.querySelectorAll('div[role="dialog"]')];
    let dialog = dialogs[dialogs.length - 1] || null;
    try { console.clear(); } catch {}
    window.ift.fin = false;
    console.log(`IFT — capture des listes de @${cible}. ift.stop() arrêter · ift.clear() tout effacer.`);

    if (!dialog) {
      // mode auto : ouvrir « abonnés » depuis le profil, « abonnements » viendra ensuite
      dialog = await attendreListe("followers");
      if (!dialog) {
        console.error("❌ IFT : panneau introuvable. Place-toi sur le profil du compte cible (ou ouvre « N abonnés ») puis relance.");
        window.ift.fin = true;
        return;
      }
    }

    await capturer(dialog);

    // bascule automatique sur l'autre liste
    const autreSuffixe = type === "abonnements" ? "followers" : "following";
    if (!stop) {
      console.log(`IFT : passage sur « ${autreSuffixe} »…`);
      const d2 = await attendreListe(autreSuffixe);
      if (d2) {
        await sleep(500);
        await capturer(d2);
      } else {
        console.warn(`IFT : impossible d'ouvrir « ${autreSuffixe} » tout seul — ouvre-la et relance le script (la capture déjà faite est dans ift.listes).`);
      }
    }

    window.ift.fin = true;
    const recap = Object.entries(resultats).map(([t, l]) => `${t}=${l.length}`).join(" · ") || "rien";
    console.log(`IFT : fini. ${recap}`);
    console.log(`IFT → dans le projet :  ./track import <profil> ~/Downloads/abonnes_*.txt ~/Downloads/abonnements_*.txt`);
  }

  main();
})();
