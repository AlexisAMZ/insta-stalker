// Usage : UPSTASH_REDIS_REST_URL=… UPSTASH_REDIS_REST_TOKEN=… node scripts/waitlist-export.mjs > liste.csv
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
if (!url || !token) {
  console.error("Variables UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN requises.");
  process.exit(1);
}

const res = await fetch(url, {
  method: "POST",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify(["HGETALL", "waitlist"]),
});
if (!res.ok) {
  console.error(`Erreur du store : ${res.status}`);
  process.exit(1);
}
const { result } = await res.json();

console.log("email,inscrit_le,source");
for (let i = 0; i < result.length; i += 2) {
  let meta = {};
  try { meta = JSON.parse(result[i + 1]); } catch { /* ligne sans métadonnées */ }
  console.log([result[i], meta.at ?? "", meta.source ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
}
