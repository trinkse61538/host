import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './client';
import type {
  AccessAccount,
  AccessRole,
  ManagedApartment,
  ParkingGuide,
  ParkingPhoto,
} from '../../domain/models';
import { runtimeConfig } from '../../config/runtime';
import { makeSlug, normalizeEmail } from '../../shared/lib/text';
import { normalizePhotoPath, normalizeStoredPhoto } from '../staticMedia/photoAssets';
import { parkingAssetPath } from '../staticMedia/parkingAssets';

export function emptyParkingGuide(): ParkingGuide {
  return {
    enabled: false,
    statusVi: '',
    statusEn: '',
    locationVi: '',
    locationEn: '',
    accessVi: '',
    accessEn: '',
    spot: '',
    mapUrl: '',
    noteVi: '',
    noteEn: '',
    internalNoteVi: '',
    internalNoteEn: '',
    internalEmailTo: '',
    internalEmailSubject: '',
    internalEmailBody: '',
    instructionsVi: [],
    instructionsEn: [],
    messageVi: '',
    messageEn: '',
    photos: [],
  };
}

export function emptyApartment(id = ''): ManagedApartment {
  return {
    id,
    apartment: '',
    wifiName: '',
    password: '',
    wifiNote: '',
    keyAddress: '',
    keyMapUrl: '',
    lockboxCode: '',
    lockboxType: '',
    instructions: '',
    instructionsVi: [],
    instructionsEn: [],
    photos: [],
    notes: '',
    propertyAddress: '',
    agency: '',
    agentEmail: '',
    agentPhone: '',
    companyPhone: '',
    airbnbAgentStatus: 'unknown',
    airbnbStrataStatus: 'unknown',
    airbnbPolicyNote: '',
    cleanerUnitPrice: 0,
    parking: emptyParkingGuide(),
  };
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    : [];
}

function parkingPhotos(value: unknown): ParkingPhoto[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((photo): photo is Record<string, unknown> => Boolean(photo) && typeof photo === 'object')
    .map(photo => {
      const rawPath = stringValue(photo.path) || stringValue(photo.storagePath) || stringValue(photo.url);
      return {
        path: parkingAssetPath(rawPath),
        captionVi: stringValue(photo.captionVi) || stringValue(photo.caption),
        captionEn: stringValue(photo.captionEn) || stringValue(photo.caption),
      };
    })
    .filter(photo => Boolean(photo.path));
}

function parseParking(value: unknown): ParkingGuide {
  const base = emptyParkingGuide();
  if (!value || typeof value !== 'object') return base;
  const raw = value as Record<string, unknown>;
  return {
    enabled: raw.enabled === true,
    statusVi: stringValue(raw.statusVi),
    statusEn: stringValue(raw.statusEn),
    locationVi: stringValue(raw.locationVi),
    locationEn: stringValue(raw.locationEn),
    accessVi: stringValue(raw.accessVi),
    accessEn: stringValue(raw.accessEn),
    spot: stringValue(raw.spot),
    mapUrl: stringValue(raw.mapUrl),
    noteVi: stringValue(raw.noteVi),
    noteEn: stringValue(raw.noteEn),
    internalNoteVi: stringValue(raw.internalNoteVi),
    internalNoteEn: stringValue(raw.internalNoteEn),
    internalEmailTo: stringValue(raw.internalEmailTo),
    internalEmailSubject: stringValue(raw.internalEmailSubject),
    internalEmailBody: stringValue(raw.internalEmailBody),
    instructionsVi: stringArray(raw.instructionsVi),
    instructionsEn: stringArray(raw.instructionsEn),
    messageVi: stringValue(raw.messageVi),
    messageEn: stringValue(raw.messageEn),
    photos: parkingPhotos(raw.photos),
  };
}

function fromDocument(id: string, value: Record<string, unknown>): ManagedApartment {
  const base = emptyApartment(id);
  return {
    ...base,
    ...value,
    id,
    instructionsVi: stringArray(value.instructionsVi),
    instructionsEn: stringArray(value.instructionsEn),
    photos: Array.isArray(value.photos)
      ? value.photos
          .filter((photo): photo is Record<string, unknown> => Boolean(photo) && typeof photo === 'object')
          .map(photo => normalizeStoredPhoto(photo))
          .filter(photo => Boolean(photo.path))
      : [],
    cleanerUnitPrice: typeof value.cleanerUnitPrice === 'number' && Number.isFinite(value.cleanerUnitPrice)
      ? Math.max(0, value.cleanerUnitPrice)
      : 0,
    parking: parseParking(value.parking),
  } as ManagedApartment;
}

export function subscribeApartments(
  onValue: (apartments: ManagedApartment[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'apartments'),
    snapshot => {
      const apartments = snapshot.docs
        .map(item => fromDocument(item.id, item.data()))
        .sort((a, b) => a.apartment.localeCompare(b.apartment));
      onValue(apartments);
    },
    error => onError(error),
  );
}

export async function resolveAccessRole(email: string): Promise<AccessRole | null> {
  const normalized = normalizeEmail(email);
  if (normalized === runtimeConfig.primaryAdminEmail) return 'admin';
  const snapshot = await getDoc(doc(db, 'access', normalized));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (data.active === false) return null;
  return ['admin', 'editor', 'viewer'].includes(data.role) ? data.role as AccessRole : null;
}

export function subscribeAccessAccounts(onValue: (accounts: AccessAccount[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'access'), snapshot => {
    const accounts = snapshot.docs.map(item => {
      const value = item.data();
      return {
        email: normalizeEmail(value.email || item.id),
        role: (['admin', 'editor', 'viewer'].includes(value.role) ? value.role : 'viewer') as AccessRole,
        active: value.active !== false,
        displayName: value.displayName || '',
      };
    }).sort((a, b) => a.email.localeCompare(b.email));

    onValue(accounts);
  });
}

export function createApartmentId(name: string, existingIds: string[]): string {
  const base = makeSlug(name);
  if (!existingIds.includes(base)) return base;
  let suffix = 2;
  while (existingIds.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function serializeParking(parking: ParkingGuide) {
  return {
    ...parking,
    photos: parking.photos
      .map(photo => ({
        path: parkingAssetPath(photo.path),
        captionVi: photo.captionVi.trim(),
        captionEn: photo.captionEn.trim(),
      }))
      .filter(photo => Boolean(photo.path)),
    instructionsVi: parking.instructionsVi.map(step => step.trim()).filter(Boolean),
    instructionsEn: parking.instructionsEn.map(step => step.trim()).filter(Boolean),
  };
}

export async function saveApartment(apartment: ManagedApartment, actorEmail: string): Promise<void> {
  if (!apartment.id) throw new Error('Apartment ID is required.');
  if (!apartment.apartment.trim()) throw new Error('Apartment name is required.');

  const photos = apartment.photos
    .map(photo => ({
      path: normalizePhotoPath(photo.path),
      caption: photo.caption.trim(),
    }))
    .filter(photo => Boolean(photo.path));

  await setDoc(doc(db, 'apartments', apartment.id), {
    apartment: apartment.apartment.trim(),
    wifiName: apartment.wifiName.trim(),
    password: apartment.password,
    wifiNote: apartment.wifiNote.trim(),
    keyAddress: apartment.keyAddress.trim(),
    keyMapUrl: apartment.keyMapUrl.trim(),
    lockboxCode: apartment.lockboxCode.trim(),
    lockboxType: apartment.lockboxType.trim(),
    instructions: apartment.instructions.trim(),
    instructionsVi: apartment.instructionsVi.map(step => step.trim()).filter(Boolean),
    instructionsEn: apartment.instructionsEn.map(step => step.trim()).filter(Boolean),
    photos,
    notes: apartment.notes.trim(),
    propertyAddress: apartment.propertyAddress.trim(),
    agency: apartment.agency.trim(),
    agentEmail: apartment.agentEmail.trim(),
    agentPhone: apartment.agentPhone.trim(),
    companyPhone: apartment.companyPhone.trim(),
    airbnbAgentStatus: apartment.airbnbAgentStatus,
    airbnbStrataStatus: apartment.airbnbStrataStatus,
    airbnbPolicyNote: apartment.airbnbPolicyNote.trim(),
    cleanerUnitPrice: Number.isFinite(apartment.cleanerUnitPrice) ? Math.max(0, apartment.cleanerUnitPrice) : 0,
    parking: serializeParking(apartment.parking),
    updatedAt: serverTimestamp(),
    updatedBy: normalizeEmail(actorEmail),
  }, { merge: true });
}

export async function saveCleanerUnitPrice(apartmentId: string, unitPrice: number, actorEmail: string): Promise<void> {
  if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error('Cleaner Unit Price must be 0 or greater.');
  await setDoc(doc(db, 'apartments', apartmentId), {
    cleanerUnitPrice: Math.round(unitPrice * 100) / 100,
    updatedAt: serverTimestamp(),
    updatedBy: normalizeEmail(actorEmail),
  }, { merge: true });
}

export async function deleteApartment(apartment: ManagedApartment): Promise<void> {
  await deleteDoc(doc(db, 'apartments', apartment.id));
}

export async function saveAccessAccount(email: string, role: AccessRole): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Please enter a valid email address.');
  }

  const enforcedRole = normalized === runtimeConfig.primaryAdminEmail ? 'admin' : role;
  const payload = { email: normalized, role: enforcedRole, active: true, updatedAt: serverTimestamp() };

  await setDoc(doc(db, 'access', normalized), payload, { merge: true });
}

export async function removeAccessAccount(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (normalized === runtimeConfig.primaryAdminEmail) {
    throw new Error('Primary admin cannot be removed.');
  }
  await deleteDoc(doc(db, 'access', normalized));
}
