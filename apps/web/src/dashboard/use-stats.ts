import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';

export type Stats = {
  totalMinutes: number;
  daysPracticed: number;
  currentStreak: number;
  phrasesTotal: number;
  phrasesMastered: number;
  phrasesRemaining: number;
  phrasesDue: number;
};

type Phase = { status: 'loading' } | { status: 'error' } | { status: 'ready'; stats: Stats };

export function useStats() {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });

  async function load() {
    setPhase({ status: 'loading' });
    const res = await apiFetch('/stats');

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    setPhase({ status: 'ready', stats: await res.json() });
  }

  useEffect(() => {
    load();
  }, []);

  return { phase, retry: load };
}
