import { useState } from 'react';
import { apiFetch } from '../api-client.js';
import { startSession } from '../dashboard/start-session.js';
import { getSessionDeadline } from '../session-deadline.js';
import { isTimeUp } from '../drill-session/is-time-up.js';
import type { Phrase, Session, StudyTopic } from '../types.js';

const BROWSE_PLANNED_MINUTES = 15;

type Phase = 'setup' | 'loading' | 'active' | 'empty' | 'time-up' | 'error';

export function useBrowseSession(topics: StudyTopic[]) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [session, setSession] = useState<Session | null>(null);
  const [phrase, setPhrase] = useState<(Phrase & { expandedBeyondTopic: boolean }) | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timerDisabled, setTimerDisabled] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  async function fetchNext(activeSession: Session, skipTimerCheck: boolean) {
    if (!skipTimerCheck && !timerDisabled && isTimeUp(getSessionDeadline(activeSession), new Date())) {
      setPhase('time-up');
      return;
    }

    setPhase('loading');
    setRevealed(false);

    const topicsQuery = topics.length > 0 ? `&topics=${topics.join(',')}` : '';
    const res = await apiFetch(`/drill/next?sessionId=${activeSession.id}${topicsQuery}`);

    if (res.status === 204) {
      setPhase('empty');
      return;
    }

    if (!res.ok) {
      setPhase('error');
      return;
    }

    setPhrase(await res.json());
    setPhase('active');
  }

  async function start(unlimited: boolean) {
    setTimerDisabled(unlimited);
    setPhase('loading');

    const newSession = await startSession(BROWSE_PLANNED_MINUTES);
    setSession(newSession);
    await fetchNext(newSession, true);
  }

  function reveal() {
    setRevealed(true);
  }

  async function grade(verdict: 'correct' | 'incorrect') {
    if (!session || !phrase) {
      return;
    }

    await apiFetch('/drill/attempt', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, phraseId: phrase.id, userAnswer: '', selfVerdict: verdict }),
    });

    setReviewedCount((count) => count + 1);
    await fetchNext(session, false);
  }

  function continueWithoutTimer() {
    setTimerDisabled(true);

    if (session) {
      fetchNext(session, true);
    }
  }

  async function finish() {
    if (session) {
      await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
    }
  }

  return {
    phase,
    session,
    phrase,
    revealed,
    timerDisabled,
    reviewedCount,
    start,
    reveal,
    grade,
    continueWithoutTimer,
    finish,
  };
}
