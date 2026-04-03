const NA_VALUES = new Set(['', 'N/A', 'NA', '-']);

export const CATATAN_OPTIONS = ['DONE', 'TIADA', 'LUPUS'] as const;

export function getCatatanSelectValue(value: string): string {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) {
    return '';
  }

  const matched = CATATAN_OPTIONS.find((option) => option === normalized);
  return matched || 'CUSTOM';
}

export function isCatatanComplete(value: string | undefined): boolean {
  const normalized = String(value || '').trim().toUpperCase();
  if (NA_VALUES.has(normalized)) {
    return false;
  }

  return true;
}
