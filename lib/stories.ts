// Stories à partager (1080×1920) : on parle de soi, jamais de quelqu'un d'autre.
// « count » barre l'ancien chiffre ; « poll » laisse le bas libre pour un sticker sondage.
export type Story = {
  id: string;
  title: string;
  lines: string[];
  sub: string;
  bg: string;
  color: string;
  muted: string;
  layout?: "headline" | "count" | "poll";
  strike?: string;
  size?: number;
};

export const STORIES: Story[] = [
  {
    id: "compte",
    title: "413 → 412",
    strike: "413",
    lines: ["412."],
    sub: "Je vais très bien, merci.",
    bg: "#f4f3ee",
    color: "#0d0d0d",
    muted: "#6b6860",
    layout: "count",
  },
  {
    id: "tri",
    title: "J'ai fait le tri",
    lines: ["J'ai fait", "le tri."],
    sub: "Dans mes abonnements.\nRien de personnel.",
    bg: "#fffc00",
    color: "#0d0d0d",
    muted: "#4a4800",
  },
  {
    id: "sondage",
    title: "Toi aussi tu regardes qui part ?",
    lines: ["Toi aussi", "tu regardes", "qui part ?"],
    sub: "Réponds. Personne ne juge.",
    bg: "#0d0d0d",
    color: "#f4f3ee",
    muted: "#a3a19a",
    layout: "poll",
  },
  {
    id: "appli",
    title: "Je ne compte pas mes abonnés",
    lines: ["Je ne compte", "pas mes", "abonnés."],
    sub: "Une appli le fait pour moi.",
    bg: "linear-gradient(150deg, #f9ce34 -10%, #ee2a7b 45%, #6228d7 110%)",
    color: "#ffffff",
    muted: "#ffe3f0",
    size: 136,
  },
  {
    id: "jalousie",
    title: "Ce n'est pas de la jalousie",
    lines: ["Ce n'est pas", "de la", "jalousie."],
    sub: "C'est de l'information.",
    bg: "#0d0d0d",
    color: "#f4f3ee",
    muted: "#a3a19a",
    size: 150,
  },
  {
    id: "exigence",
    title: "Moins d'abonnés, plus d'exigence",
    lines: ["Moins", "d'abonnés.", "Plus", "d'exigence."],
    sub: "Les deux sont liés.",
    bg: "#f4f3ee",
    color: "#0d0d0d",
    muted: "#6b6860",
    size: 156,
  },
  {
    id: "observe",
    title: "Je ne surveille pas, j'observe",
    lines: ["Je ne", "surveille pas.", "J'observe."],
    sub: "Nuance importante.",
    bg: "linear-gradient(150deg, #f9ce34 -10%, #ee2a7b 45%, #6228d7 110%)",
    color: "#ffffff",
    muted: "#ffe3f0",
    size: 140,
  },
  {
    id: "verif",
    title: "Je ne vérifie pas tous les jours",
    lines: ["Je ne vérifie", "pas tous", "les jours."],
    sub: "Un jour sur deux.\nC'est déjà un progrès.",
    bg: "#fffc00",
    color: "#0d0d0d",
    muted: "#4a4800",
    size: 140,
  },
  {
    id: "rien",
    title: "Rien à signaler",
    lines: ["Rien à", "signaler."],
    sub: "J'ai vérifié deux fois.",
    bg: "#6228d7",
    color: "#ffffff",
    muted: "#d9ccff",
  },
  {
    id: "remarque",
    title: "Tu le remarques quand on t'unfollow ?",
    lines: ["Tu le", "remarques,", "quand on", "t'unfollow ?"],
    sub: "A : oui.\nB : évidemment.",
    bg: "#ee2a7b",
    color: "#ffffff",
    muted: "#ffe3f0",
    layout: "poll",
    size: 150,
  },
];

export const getStory = (id: string) => STORIES.find((s) => s.id === id);
