import { useRef, useState } from 'react';
import { apiFetch } from '../api-client.js';
import { startSession } from '../dashboard/start-session.js';
import { getSessionDeadline } from '../session-deadline.js';
import { isTimeUp } from '../drill-session/is-time-up.js';
import type { Phrase, Session, StudyTopic } from '../types.js';

const BROWSE_PLANNED_MINUTES = 15;

type QueueItem = Phrase & { expandedBeyondTopic: boolean };

type Phase = 'setup' | 'loading' | 'active' | 'empty' | 'time-up' | 'error';

export function useBrowseSession(topics: StudyTopic[]) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [session, setSession] = useState<Session | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timerDisabled, setTimerDisabled] = useState(false);
  const submittingRef = useRef(false);

  async function loadBatch() {
    const topicsQuery = topics.length > 0 ? `?topics=${topics.join(',')}` : '';
    const res = await apiFetch(`/drill/batch${topicsQuery}`);

    if (!res.ok) {
      setPhase('error');
      return;
    }

    const data = await res.json();
    const incoming: QueueItem[] = data.phrases;

    if (incoming.length === 0) {
      setPhase('empty');
      return;
    }

    setQueue(incoming);
    setTotal((count) => count + incoming.length);
    setRevealed(false);
    setPhase('active');
  }

  async function start(unlimited: boolean) {
    setTimerDisabled(unlimited);
    setPhase('loading');

    const newSession = await startSession(BROWSE_PLANNED_MINUTES);
    setSession(newSession);
    await loadBatch();
  }

  function reveal() {
    setRevealed(true);
  }

  async function grade(verdict: 'correct' | 'incorrect') {
    if (!session || queue.length === 0 || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    const phrase = queue[0];

    await apiFetch('/drill/attempt', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, phraseId: phrase.id, userAnswer: '', selfVerdict: verdict }),
    });

    setRevealed(false);

    if (verdict === 'correct') {
      setLearnedCount((count) => count + 1);
    }

    const restOfQueue = verdict === 'correct' ? queue.slice(1) : [...queue.slice(1), phrase];

    if (!timerDisabled && isTimeUp(getSessionDeadline(session), new Date())) {
      setQueue(restOfQueue);
      setPhase('time-up');
      submittingRef.current = false;
      return;
    }

    if (restOfQueue.length === 0) {
      setPhase('loading');
      await loadBatch();
    } else {
      setQueue(restOfQueue);
    }

    submittingRef.current = false;
  }

  async function continueWithoutTimer() {
    setTimerDisabled(true);

    if (!session) {
      return;
    }

    if (queue.length > 0) {
      setPhase('active');
    } else {
      setPhase('loading');
      await loadBatch();
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
    phrase: queue[0] ?? null,
    revealed,
    timerDisabled,
    total,
    learnedCount,
    start,
    reveal,
    grade,
    continueWithoutTimer,
    finish,
  };
}
