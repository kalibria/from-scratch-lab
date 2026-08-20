import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api-client.js';
import { isTimeUp } from './is-time-up.js';
import { getSessionDeadline } from '../session-deadline.js';
import type { Phrase, Session } from '../types.js';

type Verdict = 'correct' | 'incorrect' | 'close';

type Phase =
  | { status: 'loading' }
  | { status: 'evaluating' }
  | { status: 'answering'; phrase: Phrase }
  | {
      status: 'feedback';
      phrase: Phrase;
      verdict: Verdict;
      feedback: string;
      nativePhrase: string;
      improvedFromPrevious: boolean;
    }
  | { status: 'empty' }
  | { status: 'time-up' }
  | { status: 'error' };

export function useDrillSession(session: Session) {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timerDisabled, setTimerDisabled] = useState(false);
  const [comebackPhrases, setComebackPhrases] = useState<string[]>([]);
  const requestIdRef = useRef(0);

  const deadline = getSessionDeadline(session);

  async function fetchNext() {
    const requestId = ++requestIdRef.current;

    if (!timerDisabled && isTimeUp(deadline, new Date())) {
      setPhase({ status: 'time-up' });
      return;
    }

    setPhase({ status: 'loading' });
    const res = await apiFetch('/drill/next');

    if (requestIdRef.current !== requestId) {
      return;
    }

    if (res.status === 204) {
      setPhase({ status: 'empty' });
      return;
    }

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    setPhase({ status: 'answering', phrase: await res.json() });
  }

  useEffect(() => {
    fetchNext();
  }, []);

  async function submitAnswer(userAnswer: string) {
    if (phase.status !== 'answering') {
      return;
    }

    const currentPhrase = phase.phrase;
    setPhase({ status: 'evaluating' });

    const res = await apiFetch('/drill/attempt', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, phraseId: currentPhrase.id, userAnswer }),
    });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const result = await res.json();

    if (result.improvedFromPrevious) {
      setComebackPhrases((prev) => [...prev, currentPhrase.enText]);
    }

    setPhase({
      status: 'feedback',
      phrase: currentPhrase,
      verdict: result.verdict,
      feedback: result.feedback,
      nativePhrase: result.nativePhrase,
      improvedFromPrevious: result.improvedFromPrevious,
    });
  }

  function continueWithoutTimer() {
    setTimerDisabled(true);
    fetchNext();
  }

  return {
    phase,
    showExitConfirm,
    comebackPhrases,
    fetchNext,
    submitAnswer,
    continueWithoutTimer,
    requestExit: () => setShowExitConfirm(true),
    cancelExit: () => setShowExitConfirm(false),
  };
}
