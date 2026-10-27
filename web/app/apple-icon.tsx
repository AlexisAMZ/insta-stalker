import { ImageResponse } from "next/og";
import { BrandTile } from "@/lib/brand-icon";
import { brandFonts } from "@/lib/brand-font";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(<BrandTile size={180} />, { ...size, fonts: await brandFonts() });
}
