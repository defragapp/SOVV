import { describe, it, expect } from 'vitest';
import { normalizeInsights } from './explain-extended';

describe('normalizeInsights', () => {
  it('should return an empty array if input is not an array', () => {
    expect(normalizeInsights(null)).toEqual([]);
    expect(normalizeInsights(undefined)).toEqual([]);
    expect(normalizeInsights({})).toEqual([]);
    expect(normalizeInsights("not an array")).toEqual([]);
    expect(normalizeInsights(123)).toEqual([]);
  });

  it('should filter out items without an id or invalid id', () => {
    const input = [
      null,
      undefined,
      {},
      { type: 'pattern', title: 'Test' },
      { id: 123, type: 'pattern' }, // id must be string
      { id: 'valid-id', type: 'pattern' }
    ];
    const result = normalizeInsights(input);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('valid-id');
  });

  it('should normalize valid insight objects', () => {
    const input = [
      {
        id: '1',
        type: 'dynamic',
        title: 'Valid Title',
        detail: 'Valid Detail',
        source: 'comparison'
      }
    ];

    const expected = [
      {
        id: '1',
        type: 'dynamic',
        title: 'Valid Title',
        detail: 'Valid Detail',
        source: 'comparison'
      }
    ];

    expect(normalizeInsights(input)).toEqual(expected);
  });

  it('should handle missing optional fields gracefully', () => {
    const input = [
      {
        id: '2'
      }
    ];

    const expected = [
      {
        id: '2',
        type: 'pattern',
        title: 'Insight',
        detail: '',
        source: 'conversation'
      }
    ];

    expect(normalizeInsights(input)).toEqual(expected);
  });

  it('should fallback invalid types to "pattern"', () => {
    const input = [
      { id: '3', type: 'invalid_type' },
      { id: '4', type: 'baseline' } // valid type
    ];

    const result = normalizeInsights(input);
    expect(result[0].type).toBe('pattern');
    expect(result[1].type).toBe('baseline');
  });

  it('should fallback invalid sources to "conversation"', () => {
    const input = [
      { id: '5', source: 'invalid_source' },
      { id: '6', source: 'comparison' },
      { id: '7', source: 'baseline' }
    ];

    const result = normalizeInsights(input);
    expect(result[0].source).toBe('conversation');
    expect(result[1].source).toBe('comparison');
    expect(result[2].source).toBe('baseline');
  });
});
