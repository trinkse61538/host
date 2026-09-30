import type { AirbnbPolicyStatus } from '../../domain/models';

export interface AgentDirectoryEntry {
  address: string;
  apartmentNames: string[];
  agency: string;
  phone: string;
  email: string;
  companyPhone: string;
  agentStatus: AirbnbPolicyStatus;
  strataStatus: AirbnbPolicyStatus;
  note?: string;
}

/**
 * Agent/property-manager reference transcribed from the user's source sheet
 * supplied on 2026-09-30.
 *
 * Green  -> allowed
 * Yellow -> review
 * Red    -> not_allowed
 *
 * Current listing titles are included as additional lookup aliases where a
 * reliable mapping to the source-sheet row is known. The contact/policy values
 * remain those from the source sheet.
 */
export const AGENT_DIRECTORY: AgentDirectoryEntry[] = [
  {
    address: '1306/60 Bathurst St',
    apartmentNames: [
      'Luxury 1BDR | Sparkling Harbourside',
      'Marble Enclave | Luxury Convenience',
    ],
    agency: 'Citiwise Property',
    phone: '0414 660 887',
    email: 'alex.dharma@citiwise.com.au',
    companyPhone: '(02) 9518 4399',
    agentStatus: 'not_allowed',
    strataStatus: 'not_allowed',
    note: "Don't mention airbnb",
  },
  {
    address: '7 Corfu St',
    apartmentNames: [
      'Charming Enclave | Rare Home',
      'Corfu House | Steps of CBD',
      'Coastal 2-Level Terrace | Harbour Walk',
    ],
    agency: 'Rose and Jones',
    phone: '61431151712',
    email: 'georgia@roseandjones.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '55 Little Mount St',
    apartmentNames: [
      '3BR Enclave | Fish Market & Casino',
      'Brick Enclave | 3BDR Harbour & Casino',
      'Bliss Enclave | 3BR Casino Home',
    ],
    agency: 'Grig Property',
    phone: '0406 048 088',
    email: 'pm@grig.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '345/243 Pyrmont Street',
    apartmentNames: [
      'Panoramic Haven | Waterside 1BDR',
      'City Waterside 1BDR | Casino & Market',
    ],
    agency: 'Grig PROPERTY',
    phone: '0406 048 088',
    email: 'pm@grig.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '35/48 Upper Pitt Street',
    apartmentNames: [
      'Panoramic Escape: Bridge & Opera Gem',
      'Fireworks & Billion $ Views',
    ],
    agency: 'Holmes St Clair',
    phone: '61402896332',
    email: 'pmaccounts@holmesstclair.com',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '28/2A Henry Lawson Ave',
    apartmentNames: [
      'Blue Horizon • $1 Million View',
    ],
    agency: 'Holmes St Clair',
    phone: '61402896332',
    email: 'pmaccounts@holmesstclair.com',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '17/30 Saunders Street',
    apartmentNames: [
      '3-Floor Penthouse | Casino & Harbor',
    ],
    agency: 'Raine Horne Pyrmont',
    phone: '61 417548933',
    email: 'michelle.daoud@cityliving.rh.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '7 Little Mount St',
    apartmentNames: [
      'Casino Enclave | Prime 3BR + Fish Market',
    ],
    agency: 'Raine Horne Pyrmont',
    phone: '61 417548933',
    email: 'michelle.daoud@cityliving.rh.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '48 High St',
    apartmentNames: [
      'Millers Manor | 3BR Timeless',
      'Millers Manor Terrace | 3BR',
      '3BDR Historic Waterside Enclave | Casino',
    ],
    agency: 'York Property Agents',
    phone: '0421 471 929',
    email: 'yorkpropertygroup@email.propertyme.com',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '32 Bland St',
    apartmentNames: [
      'Maritime Manor | Coastal Terrace',
    ],
    agency: 'Romic Moore',
    phone: '0457 597 373',
    email: 'pm2@romicmoore.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '1409/98 Gloucester St',
    apartmentNames: [
      'Heavens Panorama | Water Views',
    ],
    agency: 'Morton Property',
    phone: '',
    email: 'ala.zimmer@morton.com.au',
    companyPhone: '1300858221',
    agentStatus: 'not_allowed',
    strataStatus: 'not_allowed',
    note: 'Airbnb is not allowed. Nathan is NOT the tenant of this unit.',
  },
  {
    address: '2/122 Kirribilli Ave',
    apartmentNames: [
      'Timeless Harbour Enclave',
      'Waterside Enclave Home • $Million view',
    ],
    agency: 'Croll Real Estate',
    phone: '(+61) 405 544 597',
    email: 'Jorge@croll.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '278 Harris St',
    apartmentNames: [
      'Blue Enclave | Casino & Darling Harbour Walk',
    ],
    agency: 'Summit international',
    phone: '61422300008',
    email: 'George@siigroup.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '18/333 Bulwara Road',
    apartmentNames: [
      'Ultimo Chic Home | Modern 2BR',
    ],
    agency: 'Seeto Real Estate',
    phone: '61484181888',
    email: 'rentals1@seetore.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '805/50 Murray St',
    apartmentNames: [
      'Bayside Enclave | Casino & Harbour',
      'Darling Harbour Gem • Pool & Balcony',
    ],
    agency: 'LJ Hooker Pyrmont',
    phone: '61403416388',
    email: 'pm.pyrmont@ljhooker.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '175 Harris Street',
    apartmentNames: [
      'Bliss Terrace City Pad | 2 Balcony',
    ],
    agency: 'Grig Property',
    phone: '0406 048 088',
    email: 'pm@grig.com.au',
    companyPhone: '',
    agentStatus: 'review',
    strataStatus: 'allowed',
  },
  {
    address: '1 little mount street',
    apartmentNames: [],
    agency: 'Grig Property',
    phone: '0406 048 088',
    email: 'pm@grig.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '3002/38 York Street',
    apartmentNames: [
      'Luxury 3BR Skyline | Water Views',
    ],
    agency: 'PMC',
    phone: '61402009687',
    email: 'nikki@pmnc.com.au',
    companyPhone: '(02) 8278 7481',
    agentStatus: 'review',
    strataStatus: 'not_allowed',
  },
  {
    address: '110 Sussex Street',
    apartmentNames: [],
    agency: 'Tig Tag Real Estate',
    phone: '61493675532',
    email: 'rent@tigtagrealestate.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
  {
    address: '69 Harris',
    apartmentNames: [
      'The Grand Pyrmont | Casino & Harbour',
    ],
    agency: 'Raine Horne Pyrmont',
    phone: '61 417548933',
    email: 'michelle.daoud@cityliving.rh.com.au',
    companyPhone: '',
    agentStatus: 'allowed',
    strataStatus: 'allowed',
  },
];
