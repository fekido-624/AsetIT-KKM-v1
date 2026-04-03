const NA_VALUES = new Set(['', 'N/A', 'NA', '-']);

export const CATATAN_OPTIONS = ['DONE', 'TIADA', 'LUPUS'] as const;

export function isCatatanNoAsset(value: string | undefined): boolean {
  return String(value || '').trim().toUpperCase() === 'TIADA';
}

export function getCatatanSelectValue(value: string): string {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) {
    return '';
  }

  const matched = CATATAN_OPTIONS.find((option) => option === normalized);
  return matched || 'CUSTOM';
}

export function isCatatanComplete(value: string | undefined): boolean {
  if (isCatatanNoAsset(value)) {
    return false;
  }

  const normalized = String(value || '').trim().toUpperCase();
  if (NA_VALUES.has(normalized)) {
    return false;
  }

  return true;
}
