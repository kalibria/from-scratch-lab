import { describe, it, expect } from 'vitest';
import { addDays, toDateKey } from './date-utils.js';

describe('addDays', () => {
  it('adds positive days', () => {
    expect(addDays(new Date('2026-08-19T10:00:00Z'), 3)).toEqual(new Date('2026-08-22T10:00:00Z'));
  });

  it('subtracts with negative days', () => {
    expect(addDays(new Date('2026-08-19T10:00:00Z'), -1)).toEqual(new Date('2026-08-18T10:00:00Z'));
  });
});

describe('toDateKey', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(toDateKey(new Date('2026-08-19T23:59:00Z'))).toBe('2026-08-19');
  });
});
