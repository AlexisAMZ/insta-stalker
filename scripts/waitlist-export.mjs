// Usage :
//   vercel env pull .env.production.local --environment=production
//   node --env-file=.env.production.local scripts/waitlist-export.mjs > liste.csv
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL requise (voir l'en-tête du script).");
  process.exit(1);
}

const rows = await neon(url)`SELECT email, created_at, source FROM waitlist ORDER BY created_at`;
const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
console.log("email,inscrit_le,source");
for (const r of rows) console.log([r.email, new Date(r.created_at).toISOString(), r.source].map(q).join(","));
