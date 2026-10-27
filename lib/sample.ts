// Données d'exemple pour la maquette : comptes fictifs, aucun vrai utilisateur.

export type Platform = "instagram" | "snapchat";

export type Moved = {
  handle: string;
  name: string;
  hue: number;
  when: string;
  note?: string;
};

export type Capture = { id: string; label: string; date: string; count: number };

export const PLATFORM_LABEL: Record<
  Platform,
  { name: string; follows: string; gained: string; lost: string; notBack: string; badgeOut: string; badgeBack: string; badgeIn: string }
> = {
  instagram: { name: "Instagram", follows: "abonnés", gained: "Arrivées", lost: "Ils t'ont unfollow", notBack: "Ne te suivent pas en retour", badgeOut: "Unfollow", badgeBack: "Ne te suit pas", badgeIn: "Arrivée" },
  snapchat: { name: "Snapchat", follows: "amis", gained: "Ajouts", lost: "Ils t'ont retiré", notBack: "Ne t'ont pas ajouté en retour", badgeOut: "Retiré", badgeBack: "Ne t'a pas ajouté", badgeIn: "Ajout" },
};

const mk = (handle: string, name: string, hue: number, when: string, note?: string): Moved => ({
  handle,
  name,
  hue,
  when,
  note,
});

export const ARRIVED: Moved[] = [
  mk("lea.marchand", "Léa Marchand", 28, "il y a 2 j"),
  mk("tomodachi_k", "Kenji T.", 210, "il y a 2 j"),
  mk("nina.sunset", "Nina", 335, "il y a 3 j"),
  mk("yanis_dlr", "Yanis D.", 150, "il y a 3 j"),
  mk("camille.fr", "Camille Roux", 265, "il y a 4 j"),
  mk("sofiane.b", "Sofiane", 190, "il y a 5 j"),
  mk("mathilde_ph", "Mathilde P.", 12, "il y a 6 j"),
  mk("jo.vidal", "Jo Vidal", 90, "il y a 6 j"),
];

export const LEFT: Moved[] = [
  mk("clem.pxl", "Clément", 300, "il y a 1 j", "Te suivait depuis 8 mois"),
  mk("anaisbtn", "Anaïs B.", 20, "il y a 2 j", "Te suivait depuis 2 ans"),
  mk("rayan_off", "Rayan", 170, "il y a 3 j", "Compte désactivé"),
  mk("marie.lou", "Marie-Lou", 240, "il y a 4 j"),
  mk("drakkar_77", "drakkar", 55, "il y a 5 j", "Te suivait depuis 3 sem."),
  mk("ines.vrt", "Inès V.", 120, "il y a 6 j"),
];

export const NOT_BACK: Moved[] = [
  mk("kev_ofc", "Kévin", 260, "depuis 5 mois", "Tu le suis, il ne te suit pas"),
  mk("ju.lia_", "Julia", 330, "depuis 1 an", "Tu la suis, elle ne te suit pas"),
  mk("matt.zv", "Matt", 100, "depuis 3 mois", "Tu le suis, il ne te suit pas"),
  mk("sarah.bnt", "Sarah B.", 45, "depuis 2 ans", "Tu la suis, elle ne te suit pas"),
];

export type Contradiction = { handle: string; name: string; hue: number; said: string; fact: string };

export const CONTRADICTIONS: Contradiction[] = [
  { handle: "enzo_bz", name: "Enzo", hue: 20, said: "« Mais non, on est toujours potes. »", fact: "Il t'a retiré de ses amis il y a 12 jours." },
  { handle: "lola.mrt", name: "Lola", hue: 300, said: "« Je t'ai jamais bloquée. »", fact: "Elle n'apparaît plus dans ta liste depuis le 6 oct." },
  { handle: "chloe.rnd", name: "Chloé", hue: 190, said: "« Désolée, je suis occupée, je te réponds plus tard. »", fact: "Elle a envoyé des snaps il y a 3 minutes, mais pas à toi." },
  { handle: "hugo.k", name: "Hugo", hue: 160, said: "« Je viens de t'ajouter. »", fact: "Il n'est pas dans ta liste d'amis." },
];

export const CAPTURES: Capture[] = [
  { id: "c4", label: "Aujourd'hui", date: "27 oct. · 14:32", count: 1248 },
  { id: "c3", label: "Il y a 7 jours", date: "20 oct. · 09:10", count: 1243 },
  { id: "c2", label: "Il y a 21 jours", date: "6 oct. · 19:48", count: 1221 },
  { id: "c1", label: "Première capture", date: "15 sept. · 18:05", count: 1187 },
];

export const ACCOUNT = {
  instagram: { handle: "ton.compte", followers: 1248, following: 612 },
  snapchat: { handle: "ton.snap", followers: 341, following: 341 },
};

export function initials(name: string) {
  return name
    .split(/[\s.-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
