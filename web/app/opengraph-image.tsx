import { ImageResponse } from "next/og";
import { brandFonts } from "@/lib/brand-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AMZ Tracker — qui t'a suivi, qui est parti";

export default async function OpenGraph() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", fontFamily: "Bricolage Grotesque", background: "#f4f3ee", color: "#0d0d0d", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>AMZ Tracker</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 800, lineHeight: 0.95, letterSpacing: -6 }}>
          <span>Qui t&apos;a suivi.</span>
          <span>Qui est parti.</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1, height: 120, borderRadius: 28, background: "linear-gradient(140deg, #f9ce34, #ee2a7b 50%, #6228d7)", color: "#fff", fontSize: 40, fontWeight: 800, display: "flex", alignItems: "center", paddingLeft: 36 }}>
            Instagram
          </div>
          <div style={{ flex: 1, height: 120, borderRadius: 28, background: "#fffc00", fontSize: 40, fontWeight: 800, display: "flex", alignItems: "center", paddingLeft: 36 }}>
            Snapchat
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}
