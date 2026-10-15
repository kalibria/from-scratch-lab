import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';
import { startSession } from '../dashboard/start-session.js';
import { markLessonStep } from './mark-lesson-step.js';
import type { Session, SuggestedPhrase } from '../types.js';

const READING_PLANNED_MINUTES = 10;

export type TurnFeedback = {
  feedback: string;
  corrections: { mistake: string; fix: string }[];
  reply: string;
  done: boolean;
  suggestedPhrases: SuggestedPhrase[];
};

type Phase =
  | { status: 'loading' }
  | { status: 'reading'; text: string }
  | { status: 'responding'; text: string }
  | { status: 'evaluating'; text: string }
  | { status: 'turn-feedback'; text: string; latest: TurnFeedback }
  | { status: 'done' }
  | { status: 'error' };

export function useLessonReadingStep(lessonId: number) {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });
  const [utterance, setUtterance] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [readingSessionId, setReadingSessionId] = useState<number | null>(null);
  const [openingQuestion, setOpeningQuestion] = useState('');
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceTitle, setSourceTitle] = useState<string | null>(null);

  async function load() {
    setPhase({ status: 'loading' });
    setUtterance('');

    const newSession = await startSession(READING_PLANNED_MINUTES);
    const res = await apiFetch(`/lessons/${lessonId}/reading/start`, {
      method: 'POST',
      body: JSON.stringify({ sessionId: newSession.id }),
    });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const started = await res.json();
    setSession(newSession);
    setReadingSessionId(started.id);
    setOpeningQuestion(started.openingQuestion);
    setSourceUrl(started.sourceUrl);
    setSourceTitle(started.sourceTitle);
    setPhase({ status: 'reading', text: started.textContent });
  }

  useEffect(() => {
    load();
  }, [lessonId]);

  function startDiscussing() {
    if (phase.status !== 'reading') {
      return;
    }

    setPhase({
      status: 'turn-feedback',
      text: phase.text,
      latest: { feedback: '', corrections: [], reply: openingQuestion, done: false, suggestedPhrases: [] },
    });
  }

  async function submitTurn() {
    if (phase.status !== 'responding' || !readingSessionId) {
      return;
    }

    const { text } = phase;
    const userUtterance = utterance.trim();

    if (!userUtterance) {
      return;
    }

    setPhase({ status: 'evaluating', text });

    const res = await apiFetch('/lessons/reading-turn', {
      method: 'POST',
      body: JSON.stringify({ lessonReadingSessionId: readingSessionId, userUtterance }),
    });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const latest: TurnFeedback = await res.json();
    setUtterance('');
    setPhase({ status: 'turn-feedback', text, latest });
  }

  async function continueOrFinish() {
    if (phase.status !== 'turn-feedback') {
      return;
    }

    if (phase.latest.done) {
      await markLessonStep(lessonId, 'reading');
      if (session) {
        await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
      }
      setPhase({ status: 'done' });
      return;
    }

    setUtterance('');
    setPhase({ status: 'responding', text: phase.text });
  }

  async function finish() {
    if (session) {
      await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
    }
  }

  return {
    phase,
    utterance,
    setUtterance,
    sourceUrl,
    sourceTitle,
    startDiscussing,
    submitTurn,
    continueOrFinish,
    finish,
    retry: load,
  };
}
