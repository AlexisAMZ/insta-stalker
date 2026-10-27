import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const viewport = { themeColor: "#0d0d0d" };

export const metadata: Metadata = {
  title: "AMZ Tracker — qui t'a unfollow, qui te ment",
  description:
    "Sur Instagram et Snapchat, vois qui t'a unfollow, qui ne te suit pas en retour et qui te dit l'inverse de sa liste. Fais le tri.",
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
        <Header />
        {children}
      </body>
    </html>
  );
}
