import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "AMZ Tracker — qui t'a suivi, qui est parti",
  description:
    "Fais l'appel de tes abonnés Instagram et de tes amis Snapchat : une capture, une autre plus tard, et la liste exacte des arrivées et des départs.",
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
