import Footer from "@/components/Footer";
import Header from "@/components/Header";

// En-tête et pied de page des pages du site. La page d'attente et la page d'accès n'en ont pas.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
