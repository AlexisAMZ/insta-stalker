import Dashboard from "./Dashboard";

export const metadata = { title: "Tableau de bord — unfollowd" };

export default async function Page({ searchParams }: { searchParams: Promise<{ etat?: string }> }) {
  const { etat } = await searchParams;
  return <Dashboard initialEmpty={etat === "vide"} />;
}
