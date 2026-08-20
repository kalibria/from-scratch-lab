import { describe, it, expect } from 'vitest';
import { computeStreak } from './compute-streak.js';

const d = (s: string) => new Date(s);

describe('computeStreak', () => {
  it('counts consecutive days including today', () => {
    const streak = computeStreak([d('2026-08-17'), d('2026-08-18'), d('2026-08-19')], d('2026-08-19'));
    expect(streak).toBe(3);
  });

  it('does not break the streak if today has no session yet', () => {
    const streak = computeStreak([d('2026-08-17'), d('2026-08-18')], d('2026-08-19'));
    expect(streak).toBe(2);
  });

  it('breaks the streak after a full missed day', () => {
    const streak = computeStreak([d('2026-08-15'), d('2026-08-16')], d('2026-08-19'));
    expect(streak).toBe(0);
  });

  it('returns 0 with no practice history', () => {
    expect(computeStreak([], d('2026-08-19'))).toBe(0);
  });
});
