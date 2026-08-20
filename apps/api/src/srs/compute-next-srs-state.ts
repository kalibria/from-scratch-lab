import { addDays } from '../date-utils.js';

export const INTERVALS_BY_BOX = [0, 1, 3, 7, 14, 30];
const MAX_BOX = INTERVALS_BY_BOX.length - 1;

export type SrsVerdict = 'correct' | 'incorrect' | 'close';

export type SrsSnapshot = {
  box: number;
  correctStreak: number;
};

export type SrsUpdate = {
  box: number;
  intervalDays: number;
  nextReviewAt: Date;
  correctStreak: number;
  lastResult: SrsVerdict;
};

export function computeNextSrsState(current: SrsSnapshot, verdict: SrsVerdict, now: Date): SrsUpdate {
  if (verdict === 'incorrect') {
    return buildUpdate(0, 0, verdict, now);
  }

  if (verdict === 'close') {
    return buildUpdate(current.box, 0, verdict, now);
  }

  const nextBox = Math.min(current.box + 1, MAX_BOX);
  return buildUpdate(nextBox, current.correctStreak + 1, verdict, now);
}

function buildUpdate(box: number, correctStreak: number, verdict: SrsVerdict, now: Date): SrsUpdate {
  const intervalDays = INTERVALS_BY_BOX[box];
  return {
    box,
    intervalDays,
    nextReviewAt: addDays(now, intervalDays),
    correctStreak,
    lastResult: verdict,
  };
}
