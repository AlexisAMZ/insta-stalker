import { ImageResponse } from "next/og";
import { BrandTile } from "@/lib/brand-icon";
import { brandFonts } from "@/lib/brand-font";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<BrandTile size={64} />, { ...size, fonts: await brandFonts() });
}
