import type { ManagedApartment } from '../../domain/models';

const DEFAULT_PRICING: Array<{ matches: string[]; price: number }> = [
  { matches: ['1/175 Harris St', '175 Harris Street', 'Bliss Terrace City Pad | 2 Balcony'], price: 60 },
  { matches: ['1306/60 Bathurst St', 'Luxury 1BDR | Sparkling Harbourside', 'Marble Enclave | Luxury Convenience'], price: 55 },
  { matches: ['17/30 Saunders Street', '3-Floor Penthouse | Casino & Harbor'], price: 100 },
  { matches: ['18/333 Bulwara', '18/333 Bulwara Road'], price: 60 },
  { matches: ['278 Harris St', 'Blue Enclave | Casino & Darling Harbour Walk'], price: 85 },
  { matches: ['3002/38 York St', '3002/38 York Street', 'Luxury 3BR Skyline | Water Views'], price: 100 },
  { matches: ['32 Bland St'], price: 90 },
  { matches: ['345/243 Pyrmont Street', 'City Waterside 1BDR | Casino & Market', 'Sun-Lit Oasis | Darling Harbour'], price: 55 },
  { matches: ['35/48 Upper Pitt Street', 'Panoramic Escape: Bridge & Opera Gem', 'Panoramic Escape | Bridge & Opera Gem', 'Fireworks & Billion $ Views'], price: 60 },
  { matches: ['48 High St', 'Millers Manor Terrace | 3BR', '3BDR Historic Waterside Enclave | Casino'], price: 85 },
  { matches: ['55 Little Mount Street', '55 Little Mount St', 'Brick Enclave | 3BDR Harbour & Casino', 'Bliss Enclave | 3BR Casino Home'], price: 105 },
  { matches: ['69 Harris St', '69 Harris', 'The Grand Pyrmont | Casino & Harbour'], price: 100 },
  { matches: ['7 Corfu St', 'Corfu House | Steps of CBD', 'Coastal 2-Level Terrace | Harbour Walk'], price: 80 },
  { matches: ['7 Little Mount St', 'Casino Enclave | Prime 3BR + Fish Market'], price: 100 },
  { matches: ['805/50 Murray St', 'Bayside Enclave | Casino & Harbour', 'Darling Harbour Gem • Pool & Balcony'], price: 75 },
  { matches: ['1409/98 Gloucester St', 'Heavens Panorama | Water Views'], price: 60 },
  { matches: ['2/122 Kirribilli Ave', 'Waterside Enclave Home • $Million view', 'Timeless Harbour Enclave'], price: 80 },
  { matches: ['28/2A Henry Lawson Ave', 'Blue Horizon • $1 Million View'], price: 50 },
];

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function defaultCleanerPrice(apartment: ManagedApartment): number {
  if (apartment.cleanerUnitPrice > 0) return apartment.cleanerUnitPrice;
  const haystack = normalize(`${apartment.propertyAddress} ${apartment.keyAddress} ${apartment.apartment}`);
  return DEFAULT_PRICING.find(item => item.matches.some(match => haystack.includes(normalize(match))))?.price || 0;
}

export function formatAud(value: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
}
