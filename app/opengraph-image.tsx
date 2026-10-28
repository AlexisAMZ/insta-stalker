import { ImageResponse } from "next/og";
import { brandFonts } from "@/lib/brand-font";
import { INSTAGRAM_PATH, LogoMark, SNAPCHAT_PATH } from "@/components/Logos";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "unfollowd by AMZ — l'ère du stalking commence";

function Tile({ bg, color, label, path }: { bg: string; color: string; label: string; path: string }) {
  return (
    <div style={{ flex: 1, height: 132, borderRadius: 32, background: bg, color, display: "flex", alignItems: "center", gap: 24, paddingLeft: 40 }}>
      <svg viewBox="0 0 24 24" width={64} height={64}>
        <path d={path} fill={color} />
      </svg>
      <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>{label}</div>
    </div>
  );
}

export default async function OpenGraph() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", fontFamily: "Bricolage Grotesque", background: "#f4f3ee", color: "#0d0d0d", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <LogoMark size={72} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>unfollowd<span style={{ fontSize: 30, fontWeight: 800, color: "#55534d", letterSpacing: 0 }}>by AMZ</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 124, fontWeight: 800, lineHeight: 0.92, letterSpacing: -6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span>L&apos;ère du</span>
            <span style={{ background: "#fffc00", borderRadius: 24, padding: "10px 22px 18px", margin: "-10px 0 -18px" }}>stalking</span>
          </div>
          <span>commence.</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <Tile bg="linear-gradient(140deg, #f9ce34, #ee2a7b 50%, #6228d7)" color="#ffffff" label="Instagram" path={INSTAGRAM_PATH} />
          <Tile bg="#fffc00" color="#0d0d0d" label="Snapchat" path={SNAPCHAT_PATH} />
        </div>
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}
