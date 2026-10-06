import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api-client.js';
import { startSession } from '../dashboard/start-session.js';
import { markLessonStep } from './mark-lesson-step.js';
import type { Session } from '../types.js';

const CHECKPOINT_PLANNED_MINUTES = 10;
const TOTAL_ITEMS = 6;

type Verdict = 'correct' | 'incorrect' | 'close';
type VocabPhrase = { id: number; enText: string; ruGloss: string | null };
type GrammarExercise = { topicId: number; prompt: string };

type Phase =
  | { status: 'loading' }
  | { status: 'vocab'; phrase: VocabPhrase; revealed: boolean }
  | { status: 'grammar'; exercise: GrammarExercise }
  | { status: 'grammar-evaluating'; exercise: GrammarExercise }
  | { status: 'grammar-feedback'; feedback: string; verdict: Verdict }
  | { status: 'summary'; correctCount: number }
  | { status: 'error' };

export function useLessonCheckpoint(lessonId: number) {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });
  const [answer, setAnswer] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const stepRef = useRef(0);
  const correctRef = useRef(0);
  const lessonRef = useRef<{ vocabCategory: string; grammarTopicId: number } | null>(null);

  async function loadStep(activeSession: Session) {
    if (stepRef.current >= TOTAL_ITEMS) {
      await markLessonStep(lessonId, 'checkpoint', correctRef.current);
      setPhase({ status: 'summary', correctCount: correctRef.current });
      return;
    }

    setPhase({ status: 'loading' });
    setAnswer('');

    const lesson = lessonRef.current;
    if (!lesson) {
      return;
    }

    if (stepRef.current % 2 === 0) {
      const res = await apiFetch(
        `/drill/next?sessionId=${activeSession.id}&topics=${lesson.vocabCategory}&skipNewCap=true`,
      );

      if (!res.ok || res.status === 204) {
        setPhase({ status: 'error' });
        return;
      }

      setPhase({ status: 'vocab', phrase: await res.json(), revealed: false });
    } else {
      const res = await apiFetch(`/grammar/next?topicId=${lesson.grammarTopicId}`);

      if (!res.ok) {
        setPhase({ status: 'error' });
        return;
      }

      setPhase({ status: 'grammar', exercise: await res.json() });
    }
  }

  async function load() {
    setPhase({ status: 'loading' });
    const newSession = await startSession(CHECKPOINT_PLANNED_MINUTES);
    const res = await apiFetch(`/lessons/${lessonId}`);

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const lesson = await res.json();
    lessonRef.current = { vocabCategory: lesson.vocabCategory, grammarTopicId: lesson.grammarTopicId };
    stepRef.current = 0;
    correctRef.current = 0;
    setSession(newSession);
    await loadStep(newSession);
  }

  useEffect(() => {
    load();
  }, [lessonId]);

  function reveal() {
    if (phase.status !== 'vocab') {
      return;
    }
    setPhase({ ...phase, revealed: true });
  }

  async function gradeVocab(verdict: 'correct' | 'incorrect') {
    if (phase.status !== 'vocab' || !session) {
      return;
    }

    await apiFetch('/drill/attempt', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, phraseId: phase.phrase.id, userAnswer: '', selfVerdict: verdict }),
    });

    if (verdict === 'correct') {
      correctRef.current += 1;
    }

    stepRef.current += 1;
    await loadStep(session);
  }

  async function submitGrammar() {
    if (phase.status !== 'grammar' || !session) {
      return;
    }

    const userAnswer = answer.trim();
    if (!userAnswer) {
      return;
    }

    const { exercise } = phase;
    setPhase({ status: 'grammar-evaluating', exercise });

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
    if (result.verdict === 'correct') {
      correctRef.current += 1;
    }

    setPhase({ status: 'grammar-feedback', feedback: result.feedback, verdict: result.verdict });
  }

  async function nextStep() {
    if (!session) {
      return;
    }
    stepRef.current += 1;
    await loadStep(session);
  }

  async function finish() {
    if (session) {
      await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
    }
  }

  return {
    phase,
    answer,
    setAnswer,
    reveal,
    gradeVocab,
    submitGrammar,
    nextStep,
    finish,
    retry: load,
    currentStep: stepRef.current,
    totalItems: TOTAL_ITEMS,
  };
}
