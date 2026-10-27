import "server-only";

// Accès REST à Upstash Redis (variables UPSTASH_* ou KV_*, injectées par l'intégration Vercel).
const config = () => ({
  url: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN,
});

export const hasKv = () => {
  const { url, token } = config();
  return Boolean(url && token);
};

type Cmd = (string | number)[];

async function post(path: string, body: unknown): Promise<unknown> {
  const { url, token } = config();
  if (!url || !token) throw new Error("kv_not_configured");
  const res = await fetch(`${url}${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`kv_${res.status}`);
  return res.json();
}

export async function kv(command: Cmd): Promise<unknown> {
  return ((await post("", command)) as { result?: unknown }).result;
}

export async function kvPipeline(commands: Cmd[]): Promise<unknown[]> {
  const out = (await post("/pipeline", commands)) as { result?: unknown }[];
  return out.map((o) => o.result);
}
