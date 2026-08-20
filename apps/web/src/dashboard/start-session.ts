import { apiFetch } from '../api-client.js';
import type { Session } from '../types.js';

export async function startSession(plannedMinutes: number): Promise<Session> {
  const res = await apiFetch('/sessions', { method: 'POST', body: JSON.stringify({ plannedMinutes }) });
  return res.json();
}
