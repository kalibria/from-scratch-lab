import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api-client.js';
import type { Session, SuggestedPhrase } from '../types.js';

export type FreeTalkAnalysis = {
  grammar: string;
  naturalness: string;
  fluency: string;
  suggestedPhrases: SuggestedPhrase[];
};

const ANSWER_SECONDS = 90;

type Phase =
  | { status: 'loading' }
  | { status: 'reading'; prompt: string }
  | { status: 'answering'; prompt: string }
  | { status: 'analyzing' }
  | { status: 'result'; analysis: FreeTalkAnalysis }
  | { status: 'no-response' }
  | { status: 'error' };

export function useFreeTalkSession(session: Session) {
  const [phase, setPhase] = useState<Phase>({ status: 'loading' });
  const [response, setResponse] = useState('');
  const [answerDeadline, setAnswerDeadline] = useState(() => new Date(Date.now() + ANSWER_SECONDS * 1000));
  const submittedRef = useRef(false);
  const requestIdRef = useRef(0);

  async function loadPrompt() {
    const requestId = ++requestIdRef.current;

    setPhase({ status: 'loading' });
    setResponse('');
    submittedRef.current = false;

    const res = await apiFetch('/free-talk/prompt');

    if (requestIdRef.current !== requestId) {
      return;
    }

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const data = await res.json();
    setPhase({ status: 'reading', prompt: data.prompt });
  }

  useEffect(() => {
    loadPrompt();
  }, []);

  function startAnswering() {
    if (phase.status !== 'reading') {
      return;
    }
    setAnswerDeadline(new Date(Date.now() + ANSWER_SECONDS * 1000));
    setPhase({ status: 'answering', prompt: phase.prompt });
  }

  async function submitResponse() {
    if (phase.status !== 'answering' || submittedRef.current) {
      return;
    }
    submittedRef.current = true;

    const promptTopic = phase.prompt;
    const userResponse = response.trim();

    if (!userResponse) {
      setPhase({ status: 'no-response' });
      return;
    }

    setPhase({ status: 'analyzing' });

    const res = await apiFetch('/free-talk/analyze', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, promptTopic, userResponse }),
    });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    setPhase({ status: 'result', analysis: await res.json() });
  }

  return { phase, response, setResponse, answerDeadline, startAnswering, submitResponse, retry: loadPrompt };
}
