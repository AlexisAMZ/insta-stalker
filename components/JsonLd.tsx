export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Contenu statique construit côté serveur : pas d'entrée utilisateur.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
