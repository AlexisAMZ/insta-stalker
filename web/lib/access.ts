export const ACCESS_COOKIE = "amz_access";

// Mot de passe de la maquette ; surchargeable via AMZ_PASSWORD.
export const ACCESS_PASSWORD = process.env.AMZ_PASSWORD ?? "AMZAMZAMZ";

export async function accessToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`amz-tracker:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
