import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api-client.js';
import { isTimeUp } from './is-time-up.js';
import { getSessionDeadline } from '../session-deadline.js';
import type { Phrase, Session, StudyTopic } from '../types.js';

type Verdict = 'correct' | 'incorrect' | 'close';

type Phase =
  | { status: 'loading' }
  | { status: 'evaluating' }
  | { status: 'answering'; phrase: Phrase; expandedBeyondTopic: boolean }
  | {
      status: 'feedback';
      phrase: Phrase;
      verdict: Verdict;
      feedback: string;
      nativePhrase: string;
      improvedFromPrevious: boolean;
      previousBox: number;
      box: number;
    }
  | { status: 'empty' }
  | { status: 'time-up' }
  | { status: 'error' };

export function useDrillSession(session: Session, topics: StudyTopic[]) {
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
    const topicsQuery = topics.length > 0 ? `&topics=${topics.join(',')}` : '';
    const res = await apiFetch(`/drill/next?sessionId=${session.id}${topicsQuery}`);

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

    const { expandedBeyondTopic, ...phrase } = await res.json();
    setPhase({ status: 'answering', phrase, expandedBeyondTopic: Boolean(expandedBeyondTopic) });
  }

  useEffect(() => {
    fetchNext();
  }, []);

  async function submitAttempt(userAnswer: string, revealed: boolean) {
    if (phase.status !== 'answering') {
      return;
    }

    const currentPhrase = phase.phrase;
    setPhase({ status: 'evaluating' });

    const res = await apiFetch('/drill/attempt', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, phraseId: currentPhrase.id, userAnswer, revealed }),
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
      previousBox: result.previousBox,
      box: result.box,
    });
  }

  function submitAnswer(userAnswer: string) {
    return submitAttempt(userAnswer, false);
  }

  function revealAnswer() {
    return submitAttempt('', true);
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
    revealAnswer,
    continueWithoutTimer,
    requestExit: () => setShowExitConfirm(true),
    cancelExit: () => setShowExitConfirm(false),
  };
}
