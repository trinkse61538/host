import { describe, expect, it } from 'vitest';
import { emptyApartment } from '../../infrastructure/firebase/apartmentRepository';
import { findAgentFallback, policyStatus } from './agentPolicy';

describe('Airbnb policy', () => {
  it('blocks a unit when strata disallows Airbnb', () => {
    const apartment = { ...emptyApartment('york'), apartment: 'Luxury 3BR Skyline | Water Views' };
    expect(policyStatus(apartment).blocked).toBe(true);
  });

  it('allows editable Firestore fields to override fallback data', () => {
    const apartment = {
      ...emptyApartment('x'),
      apartment: 'Test',
      airbnbAgentStatus: 'allowed' as const,
      airbnbStrataStatus: 'allowed' as const,
    };
    expect(policyStatus(apartment).blocked).toBe(false);
  });

  it('uses the corrected 243 Pyrmont contact', () => {
    const apartment = {
      ...emptyApartment('pyrmont'),
      apartment: 'Panoramic Haven | Waterside 1BDR',
    };
    const agent = findAgentFallback(apartment);
    expect(agent?.agency).toBe('Grig PROPERTY');
    expect(agent?.email).toBe('pm@grig.com.au');
    expect(agent?.phone).toBe('0406 048 088');
  });

  it('uses the corrected 38 York email and policy', () => {
    const apartment = {
      ...emptyApartment('york'),
      apartment: 'Luxury 3BR Skyline | Water Views',
    };
    const agent = findAgentFallback(apartment);
    expect(agent?.email).toBe('nikki@pmnc.com.au');
    expect(agent?.companyPhone).toBe('(02) 8278 7481');
    expect(agent?.agentStatus).toBe('review');
    expect(agent?.strataStatus).toBe('not_allowed');
  });

  it('treats the 175 Harris agent status as review, not blocked', () => {
    const apartment = {
      ...emptyApartment('harris-175'),
      apartment: 'Bliss Terrace City Pad | 2 Balcony',
    };
    const status = policyStatus(apartment);
    expect(status.agent).toBe('review');
    expect(status.strata).toBe('allowed');
    expect(status.blocked).toBe(false);
  });

  it('matches current listing names added as lookup aliases', () => {
    const cases = [
      ['3BR Enclave | Fish Market & Casino', '55 Little Mount St'],
      ['Charming Enclave | Rare Home', '7 Corfu St'],
      ['Millers Manor | 3BR Timeless', '48 High St'],
      ['Maritime Manor | Coastal Terrace', '32 Bland St'],
      ['Timeless Harbour Enclave', '2/122 Kirribilli Ave'],
      ['Ultimo Chic Home | Modern 2BR', '18/333 Bulwara Road'],
      ['The Grand Pyrmont | Casino & Harbour', '69 Harris'],
      ['Fireworks & Billion $ Views', '35/48 Upper Pitt Street'],
    ] as const;

    for (const [name, address] of cases) {
      const apartment = { ...emptyApartment(name), apartment: name };
      expect(findAgentFallback(apartment)?.address).toBe(address);
    }
  });
});
