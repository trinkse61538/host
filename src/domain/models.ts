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
