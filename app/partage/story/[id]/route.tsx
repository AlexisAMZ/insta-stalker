import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/Logos";
import { brandFonts } from "@/lib/brand-font";
import { getStory, STORIES } from "@/lib/stories";

export function generateStaticParams() {
  return STORIES.map((s) => ({ id: s.id }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = getStory(id);
  if (!s) return new Response("Story introuvable", { status: 404 });

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", fontFamily: "Bricolage Grotesque", background: s.bg, color: s.color, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "160px 96px 140px" }}>
        {s.tag ? (
          <div style={{ display: "flex", alignItems: "center", height: 180, borderRadius: 40, border: `5px dashed ${s.muted}`, color: s.muted, fontSize: 64, fontWeight: 800, paddingLeft: 56 }}>
            @ ta mention ici
          </div>
        ) : (
          <div style={{ display: "flex", height: 180 }} />
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 168, fontWeight: 800, lineHeight: 0.92, letterSpacing: -8 }}>
            {s.lines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 56, fontSize: 52, fontWeight: 800, color: s.muted, letterSpacing: -1 }}>{s.sub}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <LogoMark size={110} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>unfollowd</span>
            <span style={{ fontSize: 40, fontWeight: 800, color: s.muted }}>unfollowd.com</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await brandFonts() },
  );
}
