import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AMZ Tracker",
    short_name: "AMZ",
    description: "Qui t'a unfollow, qui te ment sur Instagram et Snapchat.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f3ee",
    theme_color: "#0d0d0d",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
