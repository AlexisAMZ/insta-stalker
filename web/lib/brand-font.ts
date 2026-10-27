import { readFile } from "node:fs/promises";
import path from "node:path";

export async function brandFonts() {
  const data = await readFile(path.join(process.cwd(), "assets/bricolage-800.ttf"));
  return [{ name: "Bricolage Grotesque", data, weight: 800 as const, style: "normal" as const }];
}
