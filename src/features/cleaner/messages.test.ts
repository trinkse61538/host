import { describe, expect, it } from 'vitest';
import { buildCleanerMessage } from './messages';

describe('buildCleanerMessage', () => {
  it('normalizes a cleaner handle and numbers selected apartments', () => {
    const message = buildCleanerMessage('cleaner1', ['Unit A', 'Unit B']);
    expect(message).toContain('Hi @cleaner1');
    expect(message).toContain('1. Apartment Unit A');
    expect(message).toContain('2. Apartment Unit B');
    expect(message).toContain('cleaned 2 units');
  });

  it('keeps an existing @ prefix', () => {
    expect(buildCleanerMessage('@keanu', ['Unit A'])).toContain('Hi @keanu');
  });

  it('includes the Stock Tracker link when provided', () => {
    const message = buildCleanerMessage(
      '@keanu',
      ['Unit A'],
      'https://docs.google.com/spreadsheets/d/test-sheet/edit',
    );

    expect(message).toContain('📊 Stock Tracker: https://docs.google.com/spreadsheets/d/test-sheet/edit');
  });

});
