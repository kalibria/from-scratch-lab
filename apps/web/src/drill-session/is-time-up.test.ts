import { describe, it, expect } from 'vitest';
import { isTimeUp } from './is-time-up.js';

describe('isTimeUp', () => {
  it('is false before the deadline', () => {
    expect(isTimeUp(new Date('2026-08-19T10:15:00Z'), new Date('2026-08-19T10:00:00Z'))).toBe(false);
  });

  it('is true at the deadline', () => {
    expect(isTimeUp(new Date('2026-08-19T10:15:00Z'), new Date('2026-08-19T10:15:00Z'))).toBe(true);
  });

  it('is true after the deadline', () => {
    expect(isTimeUp(new Date('2026-08-19T10:15:00Z'), new Date('2026-08-19T10:20:00Z'))).toBe(true);
  });
});
