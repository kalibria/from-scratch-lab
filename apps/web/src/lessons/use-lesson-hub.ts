import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';
import type { LessonSummary } from '../types.js';

type Phase = { status: 'loading' } | { status: 'ready'; lessons: LessonSummary[] } | { status: 'error' };

export function useLessonHub() {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });

  async function load() {
    setPhase({ status: 'loading' });
    const res = await apiFetch('/lessons');

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    setPhase({ status: 'ready', lessons: await res.json() });
  }

  useEffect(() => {
    load();
  }, []);

  return { phase, retry: load };
}
