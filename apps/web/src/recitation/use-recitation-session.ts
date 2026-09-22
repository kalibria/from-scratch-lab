import { useState } from 'react';
import { apiFetch } from '../api-client.js';
import { startSession } from '../dashboard/start-session.js';
import type { Session } from '../types.js';

const RECITATION_PLANNED_MINUTES = 5;

export type RecitationText = { id: number; topic: string; content: string; category: string | null };

export type TurnFeedback = {
  feedback: string;
  corrections: { mistake: string; fix: string }[];
  reply: string;
  done: boolean;
};

type Phase =
  | { status: 'setup' }
  | { status: 'generating' }
  | { status: 'memorize'; text: RecitationText }
  | { status: 'listening'; text: RecitationText }
  | { status: 'evaluating'; text: RecitationText }
  | { status: 'turn-feedback'; text: RecitationText; latest: TurnFeedback }
  | { status: 'done' }
  | { status: 'error' };

export function useRecitationSession() {
  const [phase, setPhase] = useState<Phase>({ status: 'setup' });
  const [utterance, setUtterance] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [recitationSessionId, setRecitationSessionId] = useState<number | null>(null);

  async function generate(topic: string | undefined, category: string | undefined) {
    setPhase({ status: 'generating' });

    const newSession = await startSession(RECITATION_PLANNED_MINUTES);
    const genRes = await apiFetch('/recitation/generate', { method: 'POST', body: JSON.stringify({ topic, category }) });

    if (!genRes.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const text: RecitationText = await genRes.json();

    const startRes = await apiFetch('/recitation/start', {
      method: 'POST',
      body: JSON.stringify({ sessionId: newSession.id, recitationTextId: text.id }),
    });

    if (!startRes.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const started = await startRes.json();
    setSession(newSession);
    setRecitationSessionId(started.id);
    setPhase({ status: 'memorize', text });
  }

  function startListening() {
    if (phase.status !== 'memorize') {
      return;
    }
    setUtterance('');
    setPhase({ status: 'listening', text: phase.text });
  }

  async function submitTurn() {
    if (phase.status !== 'listening' || !recitationSessionId) {
      return;
    }

    const { text } = phase;
    const userUtterance = utterance.trim();

    if (!userUtterance) {
      return;
    }

    setPhase({ status: 'evaluating', text });

    const res = await apiFetch('/recitation/turn', {
      method: 'POST',
      body: JSON.stringify({ recitationSessionId, userUtterance }),
    });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const latest: TurnFeedback = await res.json();
    setPhase({ status: 'turn-feedback', text, latest });
  }

  async function continueOrFinish() {
    if (phase.status !== 'turn-feedback') {
      return;
    }

    if (phase.latest.done) {
      if (session) {
        await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
      }
      setPhase({ status: 'done' });
      return;
    }

    setUtterance('');
    setPhase({ status: 'listening', text: phase.text });
  }

  function reset() {
    setSession(null);
    setRecitationSessionId(null);
    setUtterance('');
    setPhase({ status: 'setup' });
  }

  return {
    phase,
    utterance,
    setUtterance,
    generate,
    startListening,
    submitTurn,
    continueOrFinish,
    reset,
  };
}
