<div align="center">

# IFT — Instagram Followers Tracker

**Suivez les abonnés et abonnements d'un compte Instagram dans le temps.
Capture depuis la console du navigateur, comparaisons, historique — 100 % lecture seule.**

[![License: MIT](https://img.shields.io/badge/Licence-MIT-38e1ff?style=flat-square)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-ff4d8f?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Interface](https://img.shields.io/badge/Interface-console_100%25-38e1ff?style=flat-square)](#-utilisation)
[![Sans serveur](https://img.shields.io/badge/Donn%C3%A9es-100%25_locales-4ade80?style=flat-square)](#-%C3%A9thique--limites)

*Une seule capture pour la photo initiale. Une recapture quelques jours plus tard.
Et le diff vous dit exactement **qui est arrivé, qui est parti, qui a été unfollowed.***

</div>

---

## ✨ Fonctionnalités

- **Interface complète dans la console** (`console-app.js`) — collez le script dans les DevTools, un vrai tableau de bord s'ouvre par-dessus la page : grand compteur, **flux des comptes en direct** avec avatars, onglets Abonnés / Abonnements / Comparaison, recherche, exports.
- **Les deux listes en un seul collage** — abonnés **et** abonnements, avec bascule automatique.
- **Onglet Comparaison intégré** — chargez un `.txt` précédent et voyez immédiatement les **arrivés** et les **partis**, avec rapport téléchargeable.
- **Contrôle qualité intégré** — l'app lit le nombre annoncé par le profil, compte les lignes « sans nom » (comptes supprimés/désactivés) et vous dit si quelque chose manque vraiment.
- **Autonome** — elle se déplace toute seule vers le profil, gère votre propre profil (compteurs en boutons), les onglets du panneau, et se relance après un rechargement.
- **Historique en ligne de commande** — `./track historique` montre l'évolution capture après capture ; `./track compare` détaille chaque nom.
- **Fichiers propres et datés** — `profil_abonnements_2026-09-30_143112.txt`, un `@username` par ligne, triés, diffables avec n'importe quel outil.
- **Lecture seule, discretement** — défilement progressif au rythme humain, aucun follow, aucun like, aucun message.

## 🚀 Installation

```bash
git clone https://github.com/VOTRE_COMPTE/instagram-followers-tracker.git
cd instagram-followers-tracker

# Environnement Python (pour les commandes CLI)
python3 -m venv .venv
.venv/bin/pip install instaloader

chmod +x track
```

Aucune autre dépendance : l'interface navigateur est un fichier unique, sans build.

> **Pourquoi deux voies ?** Les comptes **publics** peuvent être capturés en ligne de
> commande (`./track login` + `./track fetch`). Les comptes **privés** que votre compte
> a le droit de voir passent par l'interface navigateur, qui utilise votre session
> Instagram réelle.

## 📖 Utilisation

### 1. Capturer (compte privé, via le navigateur)

1. Sur `instagram.com`, connectée avec **votre** compte (celui qui voit les listes).
2. Placez-vous sur le profil cible.
3. **F12** → onglet **Console** → collez tout le contenu de [`console-app.js`](console-app.js) → **Entrée**.
4. Cliquez **« Lancer la capture »** : le tableau de bord s'anime, les comptes défilent en direct, puis les deux fichiers `.txt` sont téléchargés :
   ```
   amz.eth_abonnes_2026-09-30_143005.txt
   amz.eth_abonnements_2026-09-30_143112.txt
   ```

Commandes console disponibles : `ift.stop()` · `ift.clear()` · `ift.count` · `ift.lignes` · `ift.listes` · `ift.list()` · `ift.copy()` · `ift.download()` · `ift.profil("nom")` · `ift.fermer()`

### 2. Archiver et comparer

```bash
# Jour 1 — la photo de référence
./track import nom_du_profil ~/Downloads/*_abonnes_*.txt ~/Downloads/*_abonnements_*.txt

# Jour N — recapture (mêmes gestes), puis :
./track historique nom_du_profil                      # tendance des deux listes
./track compare nom_du_profil                         # qui s'est abonné / parti
./track compare nom_du_profil --type abonnements      # qui le profil suit / unfollowed
```

Sortie type :

```
Historique de @exemple

abonnés :
  2026-09-30_143005       109
  2026-10-03_181500       112   (+4 arrivées / -1 départs)

abonnements :
  2026-09-30_143112       207
  2026-10-03_181510       203   (+2 arrivées / -6 départs)
```

### 3. Comptes publics, sans navigateur

```bash
./track login votre_compte          # une seule fois (session sauvegardée)
./track fetch nom_du_profil         # abonnés
./track fetch nom_du_profil --type abonnements
```

## 🔍 Lire les chiffres

| Signal | Interprétation |
|---|---|
| Arrivées > départs, régulièrement | Croissance saine |
| Paquet de départs d'un coup | Purge de faux comptes, ou vague de désabonnements |
| Abonnements qui oscillent (suit puis unfollow en masse) | « Growth » artificielle classique |
| Écart **stable** entre le compteur du profil et la liste | Comptes supprimés/désactivés : comptés mais invisibles. Pas du mouvement. |

Seuls les noms qui **apparaissent ou disparaissent** entre deux captures comptent.

## ⚠️ Éthique & limites

- **Lecture seule, par conception** : le script fait défiler les listes et lit les noms affichés. Aucun follow, like, commentaire, message. Consulter une liste d'abonnés n'envoie aucune notification.
- **Comptes privés** : accessibles uniquement si **votre** compte a déjà le droit de voir leurs listes. L'outil ne contourne aucune permission.
- **Rate limits** : Instagram limite le débit ; comptez quelques minutes pour quelques milliers de comptes. En cas de blocage temporaire, attendez quelques heures.
- **Usage personnel** : ce projet va contre les conditions d'utilisation d'Instagram. Gardez-le léger, personnel, et n'industrialisez pas.

## 🧱 Structure

```
├── console-app.js        # Interface complète (coller dans la console)
├── console-capture.js    # Version minimale, 100 % console, sans interface
├── tracker.py            # CLI : import, historique, compare, fetch, login
├── track                 # Lanceur CLI
├── tests/mock/           # Page factice pour tester sans toucher à Instagram
└── data/                 # Vos captures (gitignoré — ne partez jamais en ligne)
```

## 🛠 Dépannage

- **⚠️ « 109/131 mais ~131 lignes »** — rien n'est raté : les lignes sans nom sont des comptes supprimés/désactivés.
- **⚠️ « et seulement ~95 lignes chargées »** — la liste n'a pas fini de charger : défilez à la molette jusqu'en bas, relancez le script.
- **Erreurs `Permissions-Policy` dans la console** — du bruit entre Chrome et Instagram, sans rapport avec l'outil. Filtrez la console avec `IFT`.

## 🙏 Crédits & inspiration

- [instaloader](https://instaloader.github.io/) — la bibliothèque de référence pour l'accès programmatique à Instagram.
- [InstagramUnfollowers](https://github.com/prado/InstagramUnfollowers) — l'idée des interfaces « scanner » en un seul collage dans la console.

## 📄 Licence

[MIT](LICENSE) — utilisez, modifiez, partagez. En votre âme et conscience.
