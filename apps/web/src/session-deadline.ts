import type { Session } from './types.js';

export function getSessionDeadline(session: Session): Date {
  return new Date(new Date(session.startedAt).getTime() + session.plannedMinutes * 60000);
}
