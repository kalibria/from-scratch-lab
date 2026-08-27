import { describe, it, expect } from 'vitest';
import { computeNextSrsState } from './compute-next-srs-state.js';

const NOW = new Date('2026-08-19T10:00:00Z');

describe('computeNextSrsState', () => {
  it('advances the box and streak on correct', () => {
    const result = computeNextSrsState({ box: 1, correctStreak: 2, failStreak: 0 }, 'correct', NOW);

    expect(result.box).toBe(2);
    expect(result.correctStreak).toBe(3);
    expect(result.failStreak).toBe(0);
    expect(result.intervalDays).toBe(3);
    expect(result.nextReviewAt).toEqual(new Date('2026-08-22T10:00:00Z'));
  });

  it('resets box and streak on incorrect', () => {
    const result = computeNextSrsState({ box: 4, correctStreak: 5, failStreak: 0 }, 'incorrect', NOW);

    expect(result.box).toBe(0);
    expect(result.correctStreak).toBe(0);
  });

  it('keeps the box but resets correct streak on close', () => {
    const result = computeNextSrsState({ box: 3, correctStreak: 2, failStreak: 0 }, 'close', NOW);

    expect(result.box).toBe(3);
    expect(result.correctStreak).toBe(0);
  });

  it('caps the box at the maximum', () => {
    const result = computeNextSrsState({ box: 5, correctStreak: 10, failStreak: 0 }, 'correct', NOW);

    expect(result.box).toBe(5);
    expect(result.intervalDays).toBe(30);
  });

  it('reviews again immediately for the first couple of failures', () => {
    const first = computeNextSrsState({ box: 2, correctStreak: 1, failStreak: 0 }, 'incorrect', NOW);
    expect(first.failStreak).toBe(1);
    expect(first.intervalDays).toBe(0);

    const second = computeNextSrsState({ box: 0, correctStreak: 0, failStreak: 1 }, 'close', NOW);
    expect(second.failStreak).toBe(2);
    expect(second.intervalDays).toBe(0);
  });

  it('gives the phrase a day of rest after three failures in a row', () => {
    const result = computeNextSrsState({ box: 0, correctStreak: 0, failStreak: 2 }, 'incorrect', NOW);

    expect(result.failStreak).toBe(3);
    expect(result.intervalDays).toBe(1);
    expect(result.nextReviewAt).toEqual(new Date('2026-08-20T10:00:00Z'));
  });

  it('resets the fail streak on a correct answer', () => {
    const result = computeNextSrsState({ box: 0, correctStreak: 0, failStreak: 4 }, 'correct', NOW);

    expect(result.failStreak).toBe(0);
  });
});
