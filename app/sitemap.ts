import type { MetadataRoute } from "next";
import { isLaunched, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isLaunched()) return [];
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
