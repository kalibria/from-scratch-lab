import { useState } from 'react';
import { useDrillSession } from './use-drill-session.js';
import { SessionTimer } from '../components/SessionTimer.js';
import { Spinner } from '../components/Spinner.js';
import { getSessionDeadline } from '../session-deadline.js';
import type { Session } from '../types.js';

type DrillSessionProps = { session: Session; onFinish: (comebackPhrases: string[]) => void };

export function DrillSession({ session, onFinish }: DrillSessionProps) {
  const { phase, showExitConfirm, comebackPhrases, fetchNext, submitAnswer, continueWithoutTimer, requestExit, cancelExit } =
    useDrillSession(session);
  const [answer, setAnswer] = useState('');
  const finish = () => onFinish(comebackPhrases);

  if (showExitConfirm) {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">
          15 minutes is the minimum that actually gets you results. Sure you want to stop early?
        </p>
        <button onClick={cancelExit} className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Continue
        </button>
        <button onClick={finish} className="w-full text-sm text-ink-soft underline">
          Stop anyway
        </button>
      </div>
    );
  }

  if (phase.status === 'time-up') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Time's up!</p>
        <button
          onClick={continueWithoutTimer}
          className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
        >
          Continue without the timer
        </button>
        <button onClick={finish} className="w-full text-sm text-ink-soft underline">
          Finish
        </button>
      </div>
    );
  }

  if (phase.status === 'empty') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">All phrases reviewed for today.</p>
        <button onClick={finish} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Finish
        </button>
      </div>
    );
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't reach the agent.</p>
        <button onClick={fetchNext} className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Retry
        </button>
        <button onClick={finish} className="w-full text-sm text-ink-soft underline">
          Finish
        </button>
      </div>
    );
  }

  if (phase.status === 'loading') {
    return <Spinner message="Finding your next phrase..." />;
  }

  if (phase.status === 'evaluating') {
    return <Spinner message="Your English teacher is checking your answer..." />;
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={requestExit} className="text-sm text-ink-soft underline">
          End session
        </button>
        <SessionTimer deadline={getSessionDeadline(session)} />
      </div>

      <p className="mb-2 text-sm text-ink-soft">Translate into English</p>
      <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 text-center font-serif text-xl">
        {phase.phrase.ruGloss}
      </div>

      {phase.status === 'answering' && (
        <>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (answer.trim()) {
                  submitAnswer(answer);
                }
              }
            }}
            rows={2}
            className="mb-4 w-full resize-none rounded-2xl border border-border px-4 py-3"
            autoFocus
          />
          <button
            onClick={() => submitAnswer(answer)}
            disabled={!answer.trim()}
            className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white disabled:opacity-50"
          >
            Answer
          </button>
        </>
      )}

      {phase.status === 'feedback' && (
        <>
          <div
            className={`mb-4 rounded-2xl px-4 py-3.5 ${
              phase.verdict === 'correct' ? 'bg-good/15' : phase.verdict === 'close' ? 'bg-warn/15' : 'bg-bad/15'
            }`}
          >
            {phase.nativePhrase && (
              <p className="mb-2 text-lg font-semibold">"{phase.nativePhrase}"</p>
            )}
            <p className="text-sm">{phase.feedback}</p>
            {phase.improvedFromPrevious && (
              <p className="mt-2 text-sm font-semibold text-good">You used to mix this up — got it right this time!</p>
            )}
          </div>
          <button
            onClick={() => {
              setAnswer('');
              fetchNext();
            }}
            className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
          >
            Next
          </button>
        </>
      )}
    </div>
  );
}
