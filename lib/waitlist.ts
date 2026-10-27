// Validation et stockage de la liste d'attente (e-mails de pré-lancement).

const EMAIL = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  const e = normalizeEmail(raw);
  return e.length <= 254 && EMAIL.test(e) && !e.includes("..");
}

/** Source marketing (utm_source) : alphanumérique, 32 caractères max. */
export function cleanSource(raw: unknown): string {
  return typeof raw === "string" ? raw.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32) : "";
}

/** Décalage entier ≥ 0 (inscrits réels pas encore importés dans la base). */
export function parseOffset(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100_000) : 0;
}

/** Nombre affiché publiquement, ou null s'il est trop petit pour être montré. */
export function visibleCount(inDb: number, offset: number, min = 5): number | null {
  const total = inDb + offset;
  return total >= min ? total : null;
}
