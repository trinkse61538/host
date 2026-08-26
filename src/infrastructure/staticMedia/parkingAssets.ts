const BUILTIN_PARKING_ASSETS: Record<string, string> = {
  'builtin:blue-enclave-key-fob': 'media/parking/blue-enclave-key-fob.jpg',
  'builtin:blue-enclave-building': 'media/parking/blue-enclave-building.jpg',
  'builtin:blue-enclave-spot-64': 'media/parking/blue-enclave-spot-64.jpg',
  'builtin:casino-enclave-building': 'media/parking/casino-enclave-building.jpg',
  'builtin:casino-enclave-key-fob': 'media/parking/casino-enclave-key-fob.jpg',
  'builtin:casino-enclave-level-2-lifts': 'media/parking/casino-enclave-level-2-lifts.jpg',
  'builtin:casino-enclave-spot-57': 'media/parking/casino-enclave-spot-57.jpg',
  'builtin:millers-manor-barangaroo-point': 'media/parking/millers-manor-barangaroo-point.jpg',
  'builtin:panoramic-escape-overview': 'media/parking/panoramic-escape-overview.jpg',
  'builtin:panoramic-escape-spot-35': 'media/parking/panoramic-escape-spot-35.jpg',
  'builtin:grand-pyrmont-private-bay': 'media/parking/grand-pyrmont-private-bay.jpg',
  'builtin:grand-pyrmont-lane-direction': 'media/parking/grand-pyrmont-lane-direction.jpg',
  'builtin:grand-pyrmont-complex-entrance': 'media/parking/grand-pyrmont-complex-entrance.jpg',
  'builtin:grand-pyrmont-house-69': 'media/parking/grand-pyrmont-house-69.jpg',
  'builtin:bayside-enclave-spot-close': 'media/parking/bayside-enclave-spot-close.jpg',
  'builtin:bayside-enclave-spot-wide': 'media/parking/bayside-enclave-spot-wide.jpg',
  'builtin:bayside-enclave-level-2-panorama': 'media/parking/bayside-enclave-level-2-panorama.jpg',
  'builtin:bayside-enclave-fob-gate': 'media/parking/bayside-enclave-fob-gate.jpg',
  'builtin:bayside-enclave-harbourside-entrance': 'media/parking/bayside-enclave-harbourside-entrance.jpg',
};

export function parkingAssetPath(value: string): string {
  const clean = value.trim().replace(/^\/+/, '');
  if (!clean) return '';
  if (/^(https?:|data:|blob:)/i.test(clean)) return clean;
  if (BUILTIN_PARKING_ASSETS[clean]) return BUILTIN_PARKING_ASSETS[clean];
  if (clean.startsWith('media/parking/')) return clean;
  if (clean.startsWith('parking/')) return `media/${clean}`;
  // Legacy user-uploaded parking media can be copied to this same relative path later.
  if (clean.startsWith('parking-media/')) return `media/parking/${clean}`;
  return clean;
}
