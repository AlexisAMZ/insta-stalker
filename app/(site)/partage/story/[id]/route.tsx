import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/Logos";
import { brandFonts } from "@/lib/brand-font";
import { getStory, STORIES, type Story } from "@/lib/stories";

export function generateStaticParams() {
  return STORIES.map((s) => ({ id: s.id }));
}

function Headline({ s }: { s: Story }) {
  const size = s.size ?? 168;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "column", fontSize: size, fontWeight: 800, lineHeight: 0.92, letterSpacing: -size * 0.045 }}>
        {s.lines.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <Sub s={s} />
    </div>
  );
}

// « \n » dans le sous-titre force la coupure, pour ne pas laisser un mot seul à la ligne.
function Sub({ s }: { s: Story }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: 56, fontSize: 52, fontWeight: 800, color: s.muted, letterSpacing: -1, lineHeight: 1.15 }}>
      {s.sub.split("\n").map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}

// L'ancien chiffre barré au-dessus, le nouveau en très grand : un diff en une image.
function Count({ s }: { s: Story }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 150, fontWeight: 800, color: s.muted, textDecoration: "line-through", letterSpacing: -6, lineHeight: 1 }}>{s.strike}</span>
      <span style={{ fontSize: 420, fontWeight: 800, letterSpacing: -22, lineHeight: 0.9, marginLeft: -12 }}>{s.lines[0]}</span>
      <div style={{ display: "flex", marginTop: 64, fontSize: 52, fontWeight: 800, color: s.muted, letterSpacing: -1 }}>{s.sub}</div>
    </div>
  );
}

function Footer({ s }: { s: Story }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <LogoMark size={110} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>unfollowd</span>
        <span style={{ fontSize: 40, fontWeight: 800, color: s.muted }}>unfollowd.com</span>
      </div>
    </div>
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = getStory(id);
  if (!s) return new Response("Story introuvable", { status: 404 });

  const poll = s.layout === "poll";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", fontFamily: "Bricolage Grotesque", background: s.bg, color: s.color, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: poll ? "220px 96px 140px" : "160px 96px 140px" }}>
        {/* Le sondage occupe le bas : le texte monte, l'espace libre reste au-dessus du logo. */}
        {!poll && <div style={{ display: "flex", height: 180 }} />}
        {s.layout === "count" ? <Count s={s} /> : <Headline s={s} />}
        {poll && <div style={{ display: "flex", height: 420 }} />}
        <Footer s={s} />
      </div>
    ),
    { width: 1080, height: 1920, fonts: await brandFonts() },
  );
}
