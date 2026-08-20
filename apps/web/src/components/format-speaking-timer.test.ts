import { describe, it, expect } from 'vitest';
import { formatSpeakingTimer } from './format-speaking-timer.js';

describe('formatSpeakingTimer', () => {
  it('formats time remaining as a plain countdown', () => {
    expect(formatSpeakingTimer(65_000)).toEqual({ text: '1:05', isOvertime: false });
  });

  it('marks exactly zero as overtime', () => {
    expect(formatSpeakingTimer(0)).toEqual({ text: '+0:00', isOvertime: true });
  });

  it('formats elapsed overtime with a plus sign', () => {
    expect(formatSpeakingTimer(-15_000)).toEqual({ text: '+0:15', isOvertime: true });
  });

  it('formats large overtime durations correctly', () => {
    expect(formatSpeakingTimer(-90_000)).toEqual({ text: '+1:30', isOvertime: true });
  });
});
