import { describe, expect, it } from 'vitest';
import { policyStatus } from './agentPolicy';
import { emptyApartment } from '../../infrastructure/firebase/apartmentRepository';

describe('Airbnb policy', () => {
  it('blocks a unit when strata disallows Airbnb', () => {
    const apartment = { ...emptyApartment('york'), apartment: 'Luxury 3BR Skyline | Water Views' };
    expect(policyStatus(apartment).blocked).toBe(true);
  });
  it('allows editable Firestore fields to override fallback data', () => {
    const apartment = { ...emptyApartment('x'), apartment: 'Test', airbnbAgentStatus: 'allowed' as const, airbnbStrataStatus: 'allowed' as const };
    expect(policyStatus(apartment).blocked).toBe(false);
  });
});
