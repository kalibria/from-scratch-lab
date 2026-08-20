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

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch('/stats')
      .then((res) => res.json())
      .then(setStats);
  }, []);

  return stats;
}
