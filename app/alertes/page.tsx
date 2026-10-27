import type { Metadata } from "next";
import { NOINDEX } from "@/lib/site";
import Alerts from "./Alerts";

export const metadata: Metadata = { title: "Alertes", description: "Capture automatique et alertes d'unfollow.", robots: NOINDEX };

export default function Page() {
  return <Alerts />;
}
