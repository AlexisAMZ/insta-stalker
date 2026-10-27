// Stories à partager (1080×1920) : texte, fond, couleur. « tag » réserve la place d'un sticker mention.
export type Story = {
  id: string;
  title: string;
  lines: string[];
  sub: string;
  bg: string;
  color: string;
  muted: string;
  tag?: boolean;
};

export const STORIES: Story[] = [
  {
    id: "tri",
    title: "J'ai fait le tri",
    lines: ["J'ai fait", "le tri."],
    sub: "Si tu ne me vois plus, c'est voulu.",
    bg: "#fffc00",
    color: "#0d0d0d",
    muted: "#4a4800",
  },
  {
    id: "tag",
    title: "Je sais que tu m'as unfollow",
    lines: ["Je sais", "que tu m'as", "unfollow."],
    sub: "Tu te reconnaîtras.",
    bg: "#0d0d0d",
    color: "#f4f3ee",
    muted: "#a3a19a",
    tag: true,
  },
  {
    id: "occupee",
    title: "« Je suis occupée »",
    lines: ["« Je suis", "occupée. »"],
    sub: "Les faits disent autre chose.",
    bg: "linear-gradient(150deg, #f9ce34 -10%, #ee2a7b 45%, #6228d7 110%)",
    color: "#ffffff",
    muted: "#ffe3f0",
  },
  {
    id: "moins",
    title: "Des gens en moins",
    lines: ["Quelques", "personnes", "en moins."],
    sub: "Et je ne me suis jamais aussi bien porté·e.",
    bg: "#f4f3ee",
    color: "#0d0d0d",
    muted: "#55534d",
  },
];

export const getStory = (id: string) => STORIES.find((s) => s.id === id);
