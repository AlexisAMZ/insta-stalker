#!/usr/bin/env python3
"""Instagram Followers Tracker.

Enregistre la liste des followers d'un profil Instagram dans un fichier daté,
puis compare les snapshots entre eux pour voir qui est arrivé ou parti.

Commandes :
  login   <ton_compte>            Se connecter une fois pour toutes (session sauvegardée)
  fetch   <profil> [--as COMPTE]  Enregistrer la liste actuelle des followers de <profil>
          [--type abonnes|abonnements]
  list    <profil>                Lister les snapshots enregistrés
  compare <profil> [--type …]     Comparer les 2 snapshots les plus récents
          [--a FICHIER --b FICHIER]  Comparer deux snapshots précis
  import  <profil> <fichiers…|->   Intégrer les fichiers capturés via la console
                                  du navigateur (plusieurs à la fois, types
                                  déduits des noms) ; "-" lit l'entrée standard
  historique <profil>             Évolution des deux listes, capture après capture

Deux types de listes : « abonnes » (ceux qui suivent le profil) et « abonnements »
(ceux que le profil suit), stockés séparément dans data/<profil>/abonnes/ et
data/<profil>/abonnements/. Par défaut, tout concerne « abonnes ».
Les snapshots sont des fichiers <AAAA-MM-JJ_HHMMSS>.txt (un @username par ligne).
Les rapports de comparaison vont dans data/<profil>/<type>/comparaisons/.
"""

import argparse
import getpass
import re
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
SNAPSHOT_FMT = "%Y-%m-%d_%H%M%S"
TYPES = ("abonnes", "abonnements")   # abonnes = suivent le profil ; abonnements = suivis par lui


def profile_dir(profile: str, type_: str = "abonnes") -> Path:
    safe = re.sub(r"[^a-z0-9._-]", "_", profile.strip().lower().lstrip("@"))
    return DATA_DIR / safe / type_


def make_loader():
    import instaloader

    return instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
        max_connection_attempts=5,
        request_timeout=300,
    )


def _session_usernames() -> list[str]:
    """Liste les sessions enregistrées (fichiers session-<compte> d'instaloader)."""
    import os

    import instaloader.instaloader as il

    configdir = il._get_config_dir()
    if not os.path.isdir(configdir):
        return []
    return sorted(
        f[len("session-"):] for f in os.listdir(configdir)
        if f.startswith("session-")
    )


def resolve_session(explicit: str | None) -> str:
    if explicit:
        return explicit.strip().lower().lstrip("@")
    names = _session_usernames()
    if len(names) == 1:
        return names[0]
    if not names:
        sys.exit("Aucune session enregistrée. Lance d'abord :  ./track login <ton_compte>")
    sys.exit(
        "Plusieurs sessions trouvées : "
        + ", ".join("@" + n for n in names)
        + "\nPrécise laquelle utiliser avec --as <ton_compte>."
    )


def read_snapshot(path: Path) -> set[str]:
    names = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            names.add(line.lstrip("@").lower())
    return names


def count_lines(path: Path) -> int:
    return len(read_snapshot(path))


# ---------------------------------------------------------------- commandes


def cmd_login(args):
    import instaloader

    username = args.username.strip().lower().lstrip("@")
    L = make_loader()
    try:
        L.load_session_from_file(username)
        print(f"✅ Une session existe déjà pour @{username}, rien à faire.")
        return
    except FileNotFoundError:
        pass

    pwd = getpass.getpass(f"Mot de passe Instagram pour @{username} : ")
    try:
        L.login(username, pwd)
    except instaloader.TwoFactorAuthRequiredException:
        code = input("Code de validation en deux étapes (2FA) : ")
        L.two_factor_login(code)
    L.save_session_to_file()
    print(f"✅ Session enregistrée pour @{username}. Tu peux maintenant lancer :")
    print(f"   ./track fetch <profil_cible>")


def cmd_fetch(args):
    import instaloader

    target = args.profile.strip().lower().lstrip("@")
    session_user = resolve_session(args.as_)

    L = make_loader()
    try:
        L.load_session_from_file(session_user)
    except FileNotFoundError:
        sys.exit(
            f"Pas de session pour @{session_user}. Lance d'abord :  ./track login {session_user}"
        )
    print(f"Session chargée : @{session_user}")

    try:
        profile = instaloader.Profile.from_username(L.context, target)
    except instaloader.ProfileNotExistsException:
        sys.exit(f"Le profil @{target} n'existe pas (ou a été renommé).")
    except instaloader.PrivateProfileNotFollowedException:
        sys.exit(
            f"@{target} est privé et @{session_user} ne le suit pas : "
            "la liste des followers est inaccessible."
        )

    if args.type == "abonnements":
        iterateur = profile.get_followees()
        total = profile.followees
        mot = "abonnements"
    else:
        iterateur = profile.get_followers()
        total = profile.followers
        mot = "abonnés"

    print(
        f"Récupération des {mot} de @{target} "
        f"({total} annoncés) — Instagram limite le débit, "
        "compte plusieurs minutes pour quelques milliers de comptes…"
    )

    usernames: list[str] = []
    incomplete = False
    try:
        for i, f in enumerate(iterateur, 1):
            usernames.append(f.username)
            if i % 500 == 0:
                print(f"  {i} followers récupérés…")
    except KeyboardInterrupt:
        incomplete = True
        print("\nInterruption : sauvegarde partielle de ce qui a été récupéré.")
    except instaloader.ConnectionException as e:
        incomplete = True
        print(f"\nConnexion interrompue ({e}) : sauvegarde partielle.", file=sys.stderr)

    usernames = sorted(set(usernames))
    out_dir = profile_dir(target, args.type)
    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime(SNAPSHOT_FMT) + ("_incomplet" if incomplete else "")
    out_file = out_dir / f"{stamp}.txt"
    out_file.write_text(
        "\n".join(usernames) + ("\n" if usernames else ""), encoding="utf-8"
    )

    print(f"✅ {len(usernames)} {mot} enregistrés dans {out_file}")
    if incomplete:
        print("⚠️  Snapshot incomplet — refais une capture complète avant de comparer.")


def cmd_list(args):
    safe = re.sub(r"[^a-z0-9._-]", "_", args.profile.strip().lower().lstrip("@"))
    racine = DATA_DIR / safe
    if not racine.is_dir():
        sys.exit(f"Aucun snapshot pour @{args.profile}. Relance : ./track fetch {args.profile}")
    print(f"Snapshots de @{args.profile} — {racine}")
    rien = True
    for t in TYPES:
        d = racine / t
        files = sorted(d.glob("*.txt")) if d.is_dir() else []
        if not files:
            continue
        rien = False
        print(f"  {t} :")
        for f in files:
            flag = "  ⚠️ incomplet" if "_incomplet" in f.stem else ""
            print(f"    {f.stem}   {count_lines(f):>7}{flag}")
    if rien:
        sys.exit(f"Aucun snapshot pour @{args.profile}. Relance : ./track fetch {args.profile}")


def cmd_compare(args):
    mot = "abonnements" if args.type == "abonnements" else "abonnés"
    label_gagnes = f"+ Nouveaux {mot} :"
    label_perdus = "- Ne suit plus :" if args.type == "abonnements" else "- Ne suivent plus :"
    d = profile_dir(args.profile, args.type)

    if args.a or args.b:
        if not (args.a and args.b):
            sys.exit("Précise les deux fichiers : --a <ancien_snapshot.txt> --b <récent.txt>")
        old_file, new_file = Path(args.a).expanduser(), Path(args.b).expanduser()
    else:
        files = sorted(d.glob("*.txt")) if d.is_dir() else []
        if len(files) < 2:
            sys.exit(
                f"Il faut au moins 2 snapshots pour comparer @{args.profile}.\n"
                f"Relise la capture avec :  ./track fetch {args.profile}"
            )
        old_file, new_file = files[-2], files[-1]

    for f in (old_file, new_file):
        if not f.is_file():
            sys.exit(f"Fichier introuvable : {f}")

    old, new = read_snapshot(old_file), read_snapshot(new_file)
    gained = sorted(new - old)
    lost = sorted(old - new)
    net = len(new) - len(old)

    print(f"Comparaison des {mot} de @{args.profile}")
    print(f"  Avant : {old_file.name}  — {len(old)} {mot}")
    print(f"  Après : {new_file.name}  — {len(new)} {mot}")
    print(f"  Nouveaux : +{len(gained)}   Partis : -{len(lost)}   Net : {net:+d}")
    if gained:
        print(f"\n{label_gagnes}")
        print("\n".join(f"  +{u}" for u in gained))
    if lost:
        print(f"\n{label_perdus}")
        print("\n".join(f"  -{u}" for u in lost))
    if not gained and not lost:
        print("\nAucun changement entre les deux snapshots.")

    if args.out:
        out = Path(args.out).expanduser()
    else:
        out_dir = d / "comparaisons"
        out_dir.mkdir(parents=True, exist_ok=True)
        out = out_dir / f"{old_file.stem}_vs_{new_file.stem}.txt"

    lines = [
        f"Comparaison des {mot} de @{args.profile}",
        f"Avant : {old_file.name} — {len(old)} {mot}",
        f"Après : {new_file.name} — {len(new)} {mot}",
        f"Nouveaux : +{len(gained)}   Partis : -{len(lost)}   Net : {net:+d}",
        "",
    ]
    if gained:
        lines.append(label_gagnes)
        lines += [f"  +{u}" for u in gained]
        lines.append("")
    if lost:
        lines.append(label_perdus)
        lines += [f"  -{u}" for u in lost]
        lines.append("")
    if not gained and not lost:
        lines.append("Aucun changement entre les deux snapshots.")
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n📄 Rapport enregistré : {out}")


def cmd_import(args):
    target = args.profile.strip().lower().lstrip("@")
    imports = 0
    for arg in args.files:
        if arg == "-":
            content, source_name = sys.stdin.read(), ""
        else:
            src = Path(arg).expanduser()
            if not src.is_file():
                print(f"⚠️  Fichier introuvable, ignoré : {src}", file=sys.stderr)
                continue
            content, source_name = src.read_text(encoding="utf-8"), src.name

        # type explicite, sinon déduit du nom du fichier (ex : abonnements_2026-…)
        type_ = args.type or (
            "abonnements"
            if re.search(r"abonnements|following", source_name, re.IGNORECASE)
            else "abonnes"
        )
        mot = "abonnements" if type_ == "abonnements" else "abonnés"

        names: list[str] = []
        for line in content.splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                names.append(line.lstrip("@").lower())
        if not names:
            print(f"⚠️  Aucun nom dans {source_name or 'l’entrée standard'}, ignoré.", file=sys.stderr)
            continue
        names = sorted(set(names))

        m = re.search(r"\d{4}-\d{2}-\d{2}_\d{6}", source_name)
        stamp = m.group(0) if m else datetime.now().strftime(SNAPSHOT_FMT)
        out_dir = profile_dir(target, type_)
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"{stamp}.txt"
        out_file.write_text("\n".join(names) + "\n", encoding="utf-8")
        print(f"✅ {len(names)} {mot} → {out_file}")
        imports += 1
    if imports:
        print(f"   Historique ensuite :  ./track historique {target}")


def cmd_historique(args):
    safe = re.sub(r"[^a-z0-9._-]", "_", args.profile.strip().lower().lstrip("@"))
    racine = DATA_DIR / safe
    if not racine.is_dir():
        sys.exit(f"Aucun snapshot pour @{args.profile}. Relance : ./track fetch {args.profile}")
    print(f"Historique de @{args.profile} — {racine}\n")
    affiche = False
    for t in TYPES:
        d = racine / t
        files = sorted(d.glob("*.txt")) if d.is_dir() else []
        if not files:
            continue
        affiche = True
        mot = "abonnements" if t == "abonnements" else "abonnés"
        print(f"{mot} :")
        old: set[str] | None = None
        for f in files:
            actuels = read_snapshot(f)
            flag = "  ⚠️ incomplet" if "_incomplet" in f.stem else ""
            if old is None:
                print(f"  {f.stem}   {len(actuels):>7}{flag}")
            else:
                g, p = len(actuels - old), len(old - actuels)
                print(f"  {f.stem}   {len(actuels):>7}   (+{g} arrivées / -{p} départs){flag}")
            old = actuels
        print("")
    if not affiche:
        sys.exit(f"Aucun snapshot pour @{args.profile}.")
    print("Détail d'une période :  ./track compare " + args.profile + " [--type abonnements]")


# --------------------------------------------------------------------- main


def main():
    parser = argparse.ArgumentParser(
        prog="track",
        description="Suivi des followers Instagram : capture + comparaison dans le temps.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("login", help="Connexion unique (session sauvegardée)")
    p.add_argument("username", help="Ton compte Instagram (celui avec lequel se connecter)")
    p.set_defaults(func=cmd_login)

    p = sub.add_parser("fetch", help="Enregistrer la liste actuelle des followers d'un profil")
    p.add_argument("profile", help="Profil cible (ex : natgeo)")
    p.add_argument("--as", dest="as_", metavar="TON_COMPTE", help="Session à utiliser si tu en as plusieurs")
    p.add_argument("--type", choices=TYPES, default="abonnes",
                   help="abonnes = ceux qui suivent le profil (défaut) ; abonnements = ceux qu'il suit")
    p.set_defaults(func=cmd_fetch)

    p = sub.add_parser("list", help="Lister les snapshots enregistrés d'un profil")
    p.add_argument("profile", help="Profil cible")
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("compare", help="Comparer deux snapshots (par défaut les 2 plus récents)")
    p.add_argument("profile", help="Profil cible")
    p.add_argument("--type", choices=TYPES, default="abonnes", help="Liste à comparer (défaut : abonnes)")
    p.add_argument("--a", help="Ancien snapshot (.txt) — sinon l'avant-dernier")
    p.add_argument("--b", help="Snapshot récent (.txt) — sinon le dernier")
    p.add_argument("--out", help="Chemin du rapport (sinon data/<profil>/comparaisons/)")
    p.set_defaults(func=cmd_compare)

    p = sub.add_parser("import", help="Intégrer les fichiers capturés via la console du navigateur")
    p.add_argument("profile", help="Profil cible")
    p.add_argument("files", nargs="+", help="Fichier(s) .txt téléchargé(s) (ou - pour l'entrée standard)")
    p.add_argument("--type", choices=TYPES,
                   help="Sinon déduit du nom de chaque fichier (ex : abonnements_…), défaut : abonnes")
    p.set_defaults(func=cmd_import)

    p = sub.add_parser("historique", help="Évolution des deux listes, capture après capture")
    p.add_argument("profile", help="Profil cible")
    p.set_defaults(func=cmd_historique)

    args = parser.parse_args()
    try:
        args.func(args)
    except ImportError:
        sys.exit(
            "instaloader n'est pas installé. Lance :\n"
            "  " + str(ROOT / ".venv/bin/pip") + " install instaloader"
        )


if __name__ == "__main__":
    main()
