import type { ApartmentPhoto } from '../../domain/models';

interface StoredPhotoLike {
  path?: unknown;
  storagePath?: unknown;
  url?: unknown;
  caption?: unknown;
}

function cleanRelativePath(value: string): string {
  return value.trim().replace(/^\/+/, '');
}

export function legacyStoragePathToStaticPath(storagePath: string): string {
  const clean = cleanRelativePath(storagePath);
  return clean ? `media/checkin/${clean}` : '';
}

export function normalizeStoredPhoto(value: StoredPhotoLike): ApartmentPhoto {
  const explicitPath = typeof value.path === 'string' ? value.path.trim() : '';
  const legacyStoragePath = typeof value.storagePath === 'string' ? value.storagePath.trim() : '';
  const legacyUrl = typeof value.url === 'string' ? value.url.trim() : '';

  const path = explicitPath
    || (legacyStoragePath ? legacyStoragePathToStaticPath(legacyStoragePath) : '')
    || legacyUrl;

  return {
    path,
    caption: typeof value.caption === 'string' ? value.caption : '',
  };
}

export function normalizePhotoPath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  return cleanRelativePath(trimmed);
}

export function photoAssetUrl(path: string): string {
  const normalized = normalizePhotoPath(path);
  if (!normalized) return '';
  if (/^(https?:|data:|blob:)/i.test(normalized)) return normalized;

  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  return `${base}/${normalized}`;
}

export function staticPhotoFolder(apartmentId: string): string {
  const safeId = cleanRelativePath(apartmentId).replace(/[^a-zA-Z0-9._-]+/g, '-');
  return `public/media/checkin/${safeId || 'apartment-id'}`;
}
