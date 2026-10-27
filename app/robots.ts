import type { MetadataRoute } from "next";
import { isLaunched, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isLaunched()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: ["/", "/legal"], disallow: ["/api/", "/acces", "/dashboard", "/comparaison", "/a-degager", "/alertes", "/connexion", "/personne/", "/viewer", "/partage"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
