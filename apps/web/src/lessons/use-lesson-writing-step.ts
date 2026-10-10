import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';
import { startSession } from '../dashboard/start-session.js';
import { markLessonStep } from './mark-lesson-step.js';
import type { Session, SuggestedPhrase } from '../types.js';

const WRITING_PLANNED_MINUTES = 10;

type Verdict = 'correct' | 'incorrect' | 'close';

type Phase =
  | { status: 'loading' }
  | { status: 'active'; prompt: string }
  | { status: 'evaluating'; prompt: string }
  | { status: 'feedback'; prompt: string; verdict: Verdict; feedback: string; suggestedPhrases: SuggestedPhrase[] }
  | { status: 'error' };

export function useLessonWritingStep(lessonId: number) {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });
  const [answer, setAnswer] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  async function load() {
    setPhase({ status: 'loading' });
    setAnswer('');

    const newSession = await startSession(WRITING_PLANNED_MINUTES);
    setSession(newSession);

    const res = await apiFetch(`/lessons/${lessonId}/writing-task`);

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const { prompt } = await res.json();
    setPhase({ status: 'active', prompt });
  }

  useEffect(() => {
    load();
  }, [lessonId]);

  async function submit() {
    if (phase.status !== 'active' || !session) {
      return;
    }

    const { prompt } = phase;
    const userAnswer = answer.trim();

    if (!userAnswer) {
      return;
    }

    setPhase({ status: 'evaluating', prompt });

    const res = await apiFetch('/lessons/writing-attempt', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, lessonId, prompt, userAnswer }),
    });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const result = await res.json();
    await markLessonStep(lessonId, 'writing');
    setPhase({
      status: 'feedback',
      prompt,
      verdict: result.verdict,
      feedback: result.feedback,
      suggestedPhrases: result.suggestedPhrases ?? [],
    });
  }

  async function finish() {
    if (session) {
      await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
    }
  }

  return { phase, answer, setAnswer, submit, finish, retry: load };
}
