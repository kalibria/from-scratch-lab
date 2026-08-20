import { describe, it, expect } from 'vitest';
import { formatRemainingTime } from './format-remaining-time.js';

describe('formatRemainingTime', () => {
  it('formats minutes and seconds with leading zero', () => {
    expect(formatRemainingTime(65_000)).toBe('1:05');
  });

  it('formats zero as 0:00', () => {
    expect(formatRemainingTime(0)).toBe('0:00');
  });

  it('clamps negative values to 0:00', () => {
    expect(formatRemainingTime(-5000)).toBe('0:00');
  });

  it('formats large durations correctly', () => {
    expect(formatRemainingTime(15 * 60 * 1000)).toBe('15:00');
  });
});
