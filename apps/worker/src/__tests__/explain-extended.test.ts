import { describe, it, expect } from 'vitest';
import { normalizeShift } from '../explain-extended';

describe('normalizeShift', () => {
  it('returns the input if it has string label and summary', () => {
    const input = { label: 'Clear', summary: 'This is clear' };
    expect(normalizeShift(input)).toEqual(input);
  });

  it('returns default shift if input is missing', () => {
    expect(normalizeShift(undefined)).toEqual({ label: 'Unclear', summary: 'The shift is still forming' });
    expect(normalizeShift(null)).toEqual({ label: 'Unclear', summary: 'The shift is still forming' });
  });

  it('returns default shift if label is not a string', () => {
    const input = { label: 123, summary: 'This is clear' };
    expect(normalizeShift(input)).toEqual({ label: 'Unclear', summary: 'The shift is still forming' });
  });

  it('returns default shift if summary is not a string', () => {
    const input = { label: 'Clear', summary: 123 };
    expect(normalizeShift(input)).toEqual({ label: 'Unclear', summary: 'The shift is still forming' });
  });

  it('returns default shift if input is not an object', () => {
    expect(normalizeShift('string')).toEqual({ label: 'Unclear', summary: 'The shift is still forming' });
    expect(normalizeShift(123)).toEqual({ label: 'Unclear', summary: 'The shift is still forming' });
  });

  it('preserves other properties if valid', () => {
    const input = { label: 'Clear', summary: 'This is clear', extra: 'prop' };
    expect(normalizeShift(input)).toEqual(input);
  });
});
