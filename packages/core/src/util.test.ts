import { safeJsonParse } from './util';

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a": 1}')).toEqual({ a: 1 });
    expect(safeJsonParse('123')).toEqual(123);
    expect(safeJsonParse('"string"')).toEqual("string");
  });

  it('returns null for invalid JSON', () => {
    expect(safeJsonParse('invalid')).toBeNull();
    expect(safeJsonParse('{"a": 1')).toBeNull();
  });
});
