/**
 * Utility for normalizing and deduplicating Cawangan/Bahagian values
 * that may have inconsistent casing in the database.
 *
 * Strategy: case-insensitive grouping — "EKSPORT" and "Eksport" are treated
 * as the same Cawangan. The canonical display name is the non-ALL-CAPS variant
 * when available, otherwise the first occurrence found.
 */

export function normalizeCawangan(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Given raw Cawangan values from DB, returns a deduplicated sorted list
 * for use in dropdown. Empty / "Kosong" entries are excluded.
 */
export function getCanonicalCawanganList(rawValues: string[]): string[] {
  // lowercase key → best display name
  const seen = new Map<string, string>();

  for (const raw of rawValues) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.toLowerCase() === 'kosong') continue;

    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, trimmed);
    } else {
      // Prefer Title Case / mixed case over ALL CAPS
      const existing = seen.get(key)!;
      const existingIsAllCaps = existing === existing.toUpperCase();
      const newIsAllCaps = trimmed === trimmed.toUpperCase();
      if (existingIsAllCaps && !newIsAllCaps) {
        seen.set(key, trimmed);
      }
    }
  }

  return Array.from(seen.values()).sort((a, b) =>
    a.localeCompare(b, 'ms', { sensitivity: 'base' })
  );
}
