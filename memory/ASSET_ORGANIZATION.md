# Organisation des assets : instagram-followers-tracker

Produit : Unfollowd (unfollowd.com) · bibliothèque marketing : `~/dev/_Vault/Unfollowd/` · audit du 2026-10-29.
À lire avant de déplacer, renommer ou ajouter une image, une vidéo, un logo ou un texte de fiche.

## Où sont les ressources

- Marque et marketing : `~/dev/_Vault/Unfollowd/` (logos, avatars, stories Instagram `fr-FR`, carte OG), migré depuis `~/dev/branding/unfollowd/` le 2026-10-29.
- Favicon : `app/icon.svg` ; images générées : `app/apple-icon.tsx`, `app/opengraph-image.tsx`.
- Police : `assets/bricolage-800.ttf`.
- Stories : générées par le site (`/partage/story/<id>`, textes dans `lib/stories.ts`).

## À garder dans le dépôt (assets d'exécution)

- `app/icon.svg`, `assets/bricolage-800.ttf` : livrés avec le site.

## Ne pas déplacer ni restructurer sans audit des dépendances

- `app/` : fichiers spéciaux Next.js (`icon`, `apple-icon`, `opengraph-image`) dont le nom est imposé.

## Exceptions constatées

- Le dossier `brand/` du dépôt n'existe plus : ses fichiers avaient déjà été sortis vers `~/dev/branding/`, désormais `_Vault/Unfollowd/`.

## Règles durables

- Le code et les ressources nécessaires à l'exécution restent dans ce dépôt.
- Les ressources marketing indépendantes vont dans `~/dev/_Vault/Unfollowd/` (règles complètes : `~/dev/_Vault/MEMORY.md`).
- `~/dev/_Vault/_shared/` ne reçoit que ce qui sert réellement à plusieurs produits.
- Un fichier utilisé par le code, servi par URL ou écrit par un script n'est jamais déplacé ni renommé sans rechercher toutes ses références (code, CSS, HTML, scripts, `package.json`, docs, fichiers `*ignore`). Une recherche sans résultat ne prouve pas qu'il est inutilisé (chargement dynamique, URL publique) : dans le doute, il reste et on le note ici.
- Aucun fichier suivi par Git n'est sorti vers `_Vault` (non versionné : l'historique serait perdu).
- Langues dans `_Vault` : codes `fr-FR`, `en-US`, `de-DE`... uniquement pour les langues produites. Les kits générés dans le dépôt gardent leurs codes d'origine.
- Nommage : minuscules et tirets, préfixe `01-`, `02-` quand l'ordre compte, mêmes noms et même ordre entre les langues, dimensions en suffixe (`tile-440x280.png`), jamais `final`, `v2-new`, `copie`.
- Une ressource n'a qu'une copie modifiable. Toute copie volontaire est notée ici avec la copie qui fait foi.

## Ajouter une ressource marketing

1. Lue par le code, servie par le site ou produite par un script du dépôt ? Elle reste dans le dépôt, à l'emplacement listé ci-dessus.
2. Sinon : `~/dev/_Vault/Unfollowd/Brand/...` ou `~/dev/_Vault/Unfollowd/Marketing/<Canal>/<langue>/<Type>/`, puis mettre à jour `~/dev/_Vault/Unfollowd/MEMORY.md` (le créer s'il n'existe pas encore).
