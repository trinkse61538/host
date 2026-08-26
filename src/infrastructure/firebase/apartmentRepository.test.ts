import { describe, expect, it } from 'vitest';
import { createApartmentId } from './apartmentRepository';

describe('createApartmentId', () => {
  it('creates a readable stable slug', () => {
    expect(createApartmentId('Luxury 3BR Skyline', [])).toBe('luxury-3br-skyline');
  });

  it('adds a suffix when an id already exists', () => {
    expect(createApartmentId('Luxury 3BR Skyline', ['luxury-3br-skyline']))
      .toBe('luxury-3br-skyline-2');
  });
});
