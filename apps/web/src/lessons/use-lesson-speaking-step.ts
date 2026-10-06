import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';
import { startSession } from '../dashboard/start-session.js';
import { markLessonStep } from './mark-lesson-step.js';
import type { Session } from '../types.js';
import type { FreeTalkAnalysis } from '../free-talk-session/use-free-talk-session.js';

const SPEAKING_PLANNED_MINUTES = 10;

type Phase =
  | { status: 'loading' }
  | { status: 'active'; prompt: string }
  | { status: 'analyzing'; prompt: string }
  | { status: 'feedback'; prompt: string; analysis: FreeTalkAnalysis }
  | { status: 'error' };

export function useLessonSpeakingStep(lessonId: number) {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });
  const [response, setResponse] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  async function load() {
    setPhase({ status: 'loading' });
    setResponse('');

    const newSession = await startSession(SPEAKING_PLANNED_MINUTES);
    const res = await apiFetch(`/lessons/${lessonId}`);

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const lesson = await res.json();
    setSession(newSession);
    setPhase({ status: 'active', prompt: lesson.speakingPrompt });
  }

  useEffect(() => {
    load();
  }, [lessonId]);

  async function submit() {
    if (phase.status !== 'active' || !session) {
      return;
    }

    const { prompt } = phase;
    const userResponse = response.trim();

    if (!userResponse) {
      return;
    }

    setPhase({ status: 'analyzing', prompt });

    const res = await apiFetch('/free-talk/analyze', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, promptTopic: prompt, userResponse }),
    });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const analysis: FreeTalkAnalysis = await res.json();
    await markLessonStep(lessonId, 'speaking');
    setPhase({ status: 'feedback', prompt, analysis });
  }

  async function finish() {
    if (session) {
      await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
    }
  }

  return { phase, response, setResponse, submit, finish, retry: load };
}
