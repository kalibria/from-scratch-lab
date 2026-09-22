import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';
import { startSession } from '../dashboard/start-session.js';
import type { Session } from '../types.js';

const GRAMMAR_PLANNED_MINUTES = 10;

type Verdict = 'correct' | 'incorrect' | 'close';

export type GrammarExercise = { topicId: number; topicName: string; level: string; box: number; prompt: string };

type Phase =
  | { status: 'loading' }
  | { status: 'exercise'; exercise: GrammarExercise }
  | { status: 'evaluating'; exercise: GrammarExercise }
  | {
      status: 'feedback';
      exercise: GrammarExercise;
      verdict: Verdict;
      feedback: string;
      box: number;
      previousBox: number;
    }
  | { status: 'empty' }
  | { status: 'error' };

export function useGrammarSession() {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });
  const [answer, setAnswer] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  async function fetchNext() {
    setPhase({ status: 'loading' });
    setAnswer('');

    const res = await apiFetch('/grammar/next');

    if (res.status === 204) {
      setPhase({ status: 'empty' });
      return;
    }

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    setPhase({ status: 'exercise', exercise: await res.json() });
  }

  useEffect(() => {
    startSession(GRAMMAR_PLANNED_MINUTES).then(setSession);
    fetchNext();
  }, []);

  async function submitAnswer() {
    if (phase.status !== 'exercise' || !session) {
      return;
    }

    const { exercise } = phase;
    const userAnswer = answer.trim();

    if (!userAnswer) {
      return;
    }

    setPhase({ status: 'evaluating', exercise });

    const res = await apiFetch('/grammar/attempt', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: session.id,
        topicId: exercise.topicId,
        exercisePrompt: exercise.prompt,
        userAnswer,
      }),
    });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const result = await res.json();
    setPhase({
      status: 'feedback',
      exercise,
      verdict: result.verdict,
      feedback: result.feedback,
      box: result.box,
      previousBox: result.previousBox,
    });
  }

  async function finish() {
    if (session) {
      await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
    }
  }

  return { phase, answer, setAnswer, fetchNext, submitAnswer, finish };
}
