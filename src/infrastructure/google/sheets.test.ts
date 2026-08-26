import { describe, expect, it } from 'vitest';
import { extractSpreadsheetId } from './sheets';

describe('extractSpreadsheetId', () => {
  it('accepts a raw ID', () => expect(extractSpreadsheetId('abc_123')).toBe('abc_123'));
  it('extracts an ID from a Google Sheets URL', () => {
    expect(extractSpreadsheetId('https://docs.google.com/spreadsheets/d/abc_123/edit#gid=0')).toBe('abc_123');
  });
});
