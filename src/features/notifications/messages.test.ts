import { describe, expect, it } from 'vitest';
import type { SheetReport } from '../../domain/models';
import { buildShortageMessage } from './messages';

function report(sheetName: string, names: string[]): SheetReport {
  return {
    sheetName,
    lastRowIndex: 1,
    headers: [],
    values: [],
    lowItems: names.map(name => ({ name, value: 'low' })),
    hasLowStock: true,
  };
}

describe('buildShortageMessage', () => {
  it('returns a clear empty-state message when nothing is selected', () => {
    expect(buildShortageMessage([])).toBe('No apartments selected.');
  });

  it('builds one combined guest-facing message for selected apartments', () => {
    const message = buildShortageMessage([
      report('Unit A', ['Water', 'Tissues']),
      report('Unit B', ['Coffee']),
    ]);

    expect(message).toContain('Apartment Unit A is low on: Water, Tissues.');
    expect(message).toContain('Apartment Unit B is low on: Coffee.');
    expect(message).toContain('keep the receipt');
  });

  it('includes the Stock Tracker link when provided', () => {
    const message = buildShortageMessage(
      [report('Unit A', ['Water'])],
      'https://docs.google.com/spreadsheets/d/test-sheet/edit',
    );

    expect(message).toContain('📊 Stock Tracker: https://docs.google.com/spreadsheets/d/test-sheet/edit');
  });

});
