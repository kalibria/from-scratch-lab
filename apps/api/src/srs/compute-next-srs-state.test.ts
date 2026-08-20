import { describe, it, expect } from 'vitest';
import { computeNextSrsState } from './compute-next-srs-state.js';

const NOW = new Date('2026-08-19T10:00:00Z');

describe('computeNextSrsState', () => {
  it('advances the box and streak on correct', () => {
    const result = computeNextSrsState({ box: 1, correctStreak: 2 }, 'correct', NOW);

    expect(result.box).toBe(2);
    expect(result.correctStreak).toBe(3);
    expect(result.intervalDays).toBe(3);
    expect(result.nextReviewAt).toEqual(new Date('2026-08-22T10:00:00Z'));
  });

  it('resets box and streak on incorrect', () => {
    const result = computeNextSrsState({ box: 4, correctStreak: 5 }, 'incorrect', NOW);

    expect(result.box).toBe(0);
    expect(result.correctStreak).toBe(0);
  });

  it('keeps the box but resets streak on close', () => {
    const result = computeNextSrsState({ box: 3, correctStreak: 2 }, 'close', NOW);

    expect(result.box).toBe(3);
    expect(result.correctStreak).toBe(0);
    expect(result.intervalDays).toBe(7);
  });

  it('caps the box at the maximum', () => {
    const result = computeNextSrsState({ box: 5, correctStreak: 10 }, 'correct', NOW);

    expect(result.box).toBe(5);
    expect(result.intervalDays).toBe(30);
  });
});
