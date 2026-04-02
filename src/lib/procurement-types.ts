export const PROCUREMENT_TYPE_OPTIONS = [
  'Asset Kerajaan',
  'Sewaan Berpusat',
  'Sewaan',
];

export function getProcurementSelectValue(value: string) {
  const normalized = String(value || '').trim().toLowerCase();
  const match = PROCUREMENT_TYPE_OPTIONS.find((option) => option.toLowerCase() === normalized);
  return match || 'custom';
}
