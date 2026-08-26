export type AccessRole = 'admin' | 'editor' | 'viewer';
export type AirbnbPolicyStatus = 'allowed' | 'not_allowed' | 'review' | 'unknown';

export interface AccessAccount {
  email: string;
  role: AccessRole;
  active: boolean;
  displayName?: string;
}

export interface ApartmentPhoto {
  /**
   * Repository-managed asset path, normally under public/media/checkin/.
   * Store the path relative to public, e.g. media/checkin/unit-a/01-door.jpg.
   */
  path: string;
  caption: string;
}

export interface ParkingPhoto {
  /** Repository-managed path relative to public/, normally media/parking/... */
  path: string;
  captionVi: string;
  captionEn: string;
}

export interface ParkingGuide {
  enabled: boolean;
  statusVi: string;
  statusEn: string;
  locationVi: string;
  locationEn: string;
  accessVi: string;
  accessEn: string;
  spot: string;
  mapUrl: string;
  noteVi: string;
  noteEn: string;
  internalNoteVi: string;
  internalNoteEn: string;
  internalEmailTo: string;
  internalEmailSubject: string;
  internalEmailBody: string;
  instructionsVi: string[];
  instructionsEn: string[];
  messageVi: string;
  messageEn: string;
  photos: ParkingPhoto[];
}

export interface ManagedApartment {
  id: string;
  apartment: string;
  wifiName: string;
  password: string;
  wifiNote: string;
  keyAddress: string;
  keyMapUrl: string;
  lockboxCode: string;
  lockboxType: string;
  instructions: string;
  instructionsVi: string[];
  instructionsEn: string[];
  photos: ApartmentPhoto[];
  notes: string;
  propertyAddress: string;
  agency: string;
  agentEmail: string;
  agentPhone: string;
  companyPhone: string;
  airbnbAgentStatus: AirbnbPolicyStatus;
  airbnbStrataStatus: AirbnbPolicyStatus;
  airbnbPolicyNote: string;
  cleanerUnitPrice: number;
  parking: ParkingGuide;
}

export interface LowItem { name: string; value: string; }
export interface SheetReport {
  sheetName: string;
  lastRowIndex: number;
  headers: string[];
  values: string[];
  lowItems: LowItem[];
  hasLowStock: boolean;
}

export interface NotificationConfigs {
  telegram: { botToken: string; chatId: string; enabled: boolean };
  discord: { webhookUrl: string; enabled: boolean };
  webhook: { url: string; enabled: boolean };
  pushover: { userKey: string; apiToken: string; enabled: boolean };
}
