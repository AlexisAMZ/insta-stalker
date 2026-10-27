import { ARRIVED, CONTRADICTIONS, LEFT, NOT_BACK, type Moved, type Platform } from "./sample";

export type PersonKind = "out" | "back" | "in" | "lie";

export type Person = {
  handle: string;
  name: string;
  hue: number;
  kind: PersonKind;
  platform: Platform;
  when: string;
  note?: string;
  said?: string;
  fact?: string;
  events: { date: string; text: string }[];
};

const from = (m: Moved, kind: PersonKind, events: Person["events"]): Person => ({
  handle: m.handle,
  name: m.name,
  hue: m.hue,
  kind,
  platform: "instagram",
  when: m.when,
  note: m.note,
  events,
});

export const PEOPLE: Person[] = [
  ...LEFT.map((m) =>
    from(m, "out", [
      { date: "15 sept.", text: "Premier relevé : cette personne te suivait." },
      { date: "20 oct.", text: "Toujours dans ta liste." },
      { date: "27 oct.", text: "N'apparaît plus dans ta liste d'abonnés." },
    ]),
  ),
  ...NOT_BACK.map((m) =>
    from(m, "back", [
      { date: "15 sept.", text: "Tu la ou le suivais déjà." },
      { date: "27 oct.", text: "Elle ou il ne te suit toujours pas en retour." },
    ]),
  ),
  ...ARRIVED.map((m) =>
    from(m, "in", [
      { date: m.when, text: "Apparaît dans ta liste d'abonnés pour la première fois." },
    ]),
  ),
  ...CONTRADICTIONS.map<Person>((c) => ({
    handle: c.handle,
    name: c.name,
    hue: c.hue,
    kind: "lie",
    platform: "snapchat",
    when: "cette semaine",
    said: c.said,
    fact: c.fact,
    events: [
      { date: "20 oct.", text: "Dans tes amis." },
      { date: "27 oct.", text: c.fact },
    ],
  })),
];

export const getPerson = (handle: string) => PEOPLE.find((p) => p.handle === handle);

export const KIND_LABEL: Record<PersonKind, string> = {
  out: "T'a unfollow",
  back: "Ne te suit pas en retour",
  in: "Nouvelle arrivée",
  lie: "Dit l'inverse de ce que montre ton compte",
};
