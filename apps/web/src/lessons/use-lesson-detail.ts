import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';
import type { LessonDetail } from '../types.js';

type Phase = { status: 'loading' } | { status: 'ready'; lesson: LessonDetail } | { status: 'error' };

export function useLessonDetail(lessonId: number) {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });

  async function load() {
    setPhase({ status: 'loading' });
    const res = await apiFetch(`/lessons/${lessonId}`);

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    setPhase({ status: 'ready', lesson: await res.json() });
  }

  useEffect(() => {
    load();
  }, [lessonId]);

  return { phase, retry: load };
}
