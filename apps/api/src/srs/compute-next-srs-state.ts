import { addDays } from '../date-utils.js';

export const INTERVALS_BY_BOX = [0, 1, 3, 7, 14, 30];
const MAX_BOX = INTERVALS_BY_BOX.length - 1;
const FAIL_STREAK_REST_THRESHOLD = 3;
const REST_INTERVAL_DAYS = 1;

export type SrsVerdict = 'correct' | 'incorrect' | 'close';

export type SrsSnapshot = {
  box: number;
  correctStreak: number;
  failStreak: number;
};

export type SrsUpdate = {
  box: number;
  intervalDays: number;
  nextReviewAt: Date;
  correctStreak: number;
  failStreak: number;
  lastResult: SrsVerdict;
};

export function computeNextSrsState(current: SrsSnapshot, verdict: SrsVerdict, now: Date): SrsUpdate {
  if (verdict === 'correct') {
    const nextBox = Math.min(current.box + 1, MAX_BOX);
    return buildUpdate(nextBox, INTERVALS_BY_BOX[nextBox], current.correctStreak + 1, 0, verdict, now);
  }

  const failStreak = current.failStreak + 1;
  const box = verdict === 'incorrect' ? 0 : current.box;
  const isResting = failStreak >= FAIL_STREAK_REST_THRESHOLD;

  return buildUpdate(box, isResting ? REST_INTERVAL_DAYS : 0, 0, failStreak, verdict, now);
}

function buildUpdate(
  box: number,
  intervalDays: number,
  correctStreak: number,
  failStreak: number,
  verdict: SrsVerdict,
  now: Date,
): SrsUpdate {
  return {
    box,
    intervalDays,
    nextReviewAt: addDays(now, intervalDays),
    correctStreak,
    failStreak,
    lastResult: verdict,
  };
}
