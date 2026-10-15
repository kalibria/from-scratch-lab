import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';
import { startSession } from '../dashboard/start-session.js';
import { markLessonStep } from './mark-lesson-step.js';
import type { Session, SuggestedPhrase } from '../types.js';

const VIDEO_PLANNED_MINUTES = 15;

type Phase =
  | { status: 'loading' }
  | { status: 'active'; videoUrl: string | null; videoTitle: string | null }
  | { status: 'extracting' }
  | { status: 'feedback'; suggestedPhrases: SuggestedPhrase[] }
  | { status: 'error' };

export function useLessonVideoStep(lessonId: number) {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });
  const [reflection, setReflection] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  async function load() {
    setPhase({ status: 'loading' });
    setReflection('');

    const newSession = await startSession(VIDEO_PLANNED_MINUTES);
    const res = await apiFetch(`/lessons/${lessonId}`);

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const lesson = await res.json();
    setSession(newSession);
    setPhase({ status: 'active', videoUrl: lesson.videoUrl, videoTitle: lesson.videoTitle });
  }

  useEffect(() => {
    load();
  }, [lessonId]);

  async function submit() {
    const userReflection = reflection.trim();

    if (!userReflection || !session) {
      return;
    }

    setPhase({ status: 'extracting' });

    const res = await apiFetch('/lessons/video-reflection', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, lessonId, reflection: userReflection }),
    });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const { phrases } = await res.json();
    await markLessonStep(lessonId, 'video');
    setPhase({ status: 'feedback', suggestedPhrases: phrases });
  }

  async function finish() {
    if (session) {
      await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
    }
  }

  return { phase, reflection, setReflection, submit, finish, retry: load };
}
