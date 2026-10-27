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

export const PLATFORM_LABEL: Record<Platform, { name: string; follows: string; gained: string; lost: string }> = {
  instagram: { name: "Instagram", follows: "abonnés", gained: "Arrivées", lost: "Départs" },
  snapchat: { name: "Snapchat", follows: "amis", gained: "Ajouts", lost: "Retraits" },
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
