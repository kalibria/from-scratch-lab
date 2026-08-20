import { addDays, toDateKey } from '../date-utils.js';

export function computeStreak(practiceDates: Date[], today: Date): number {
  const days = new Set(practiceDates.map(toDateKey));
  let cursor = days.has(toDateKey(today)) ? today : addDays(today, -1);
  let streak = 0;

  while (days.has(toDateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return streak;
}
