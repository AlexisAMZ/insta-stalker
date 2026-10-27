import type { Metadata } from "next";
import "./globals.css";
import Analytics from "@/components/Analytics";
import { isLaunched, NOINDEX, SITE_NAME, SITE_URL } from "@/lib/site";

export const viewport = { themeColor: "#0d0d0d" };

const TITLE = "unfollowd — qui t'a unfollow sur Instagram et Snapchat";
const DESCRIPTION =
  "Découvre qui t'a unfollow, qui ne te suit pas en retour et qui te ment sur Instagram et Snapchat. Compare deux captures et fais le tri.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — unfollowd" },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["qui m'a unfollow", "savoir qui m'a unfollow Instagram", "unfollowers Instagram", "qui m'a retiré Snapchat", "ne me suit pas en retour", "unfollowd"],
  authors: [{ name: "AMZ" }],
  openGraph: { type: "website", locale: "fr_FR", siteName: SITE_NAME, title: TITLE, description: DESCRIPTION, url: "/" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: isLaunched() ? { index: true, follow: true } : NOINDEX,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
