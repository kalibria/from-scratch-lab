import { useState } from 'react';
import { useGrammarSession } from './use-grammar-session.js';
import { Spinner } from '../components/Spinner.js';
import { BoxDots } from '../components/BoxDots.js';

type GrammarSessionProps = { onDone: () => void };

export function GrammarSession({ onDone }: GrammarSessionProps) {
  const { phase, answer, setAnswer, fetchNext, submitAnswer, finish } = useGrammarSession();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const finishAndExit = async () => {
    await finish();
    onDone();
  };

  if (showExitConfirm) {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Stop practicing grammar for now?</p>
        <button
          onClick={() => setShowExitConfirm(false)}
          className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
        >
          Continue
        </button>
        <button onClick={finishAndExit} className="w-full text-sm text-ink-soft underline">
          Stop
        </button>
      </div>
    );
  }

  if (phase.status === 'loading') {
    return <Spinner message="Finding a topic..." />;
  }

  if (phase.status === 'evaluating') {
    return <Spinner message="Checking your answer..." />;
  }

  if (phase.status === 'empty') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">All grammar topics reviewed for today.</p>
        <button onClick={finishAndExit} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
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
        <button onClick={finishAndExit} className="w-full text-sm text-ink-soft underline">
          Finish
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => setShowExitConfirm(true)} className="text-sm text-ink-soft underline">
          End session
        </button>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-ink-soft">
          {phase.exercise.level}
        </span>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-ink-soft">{phase.exercise.topicName}</p>
        <BoxDots box={phase.exercise.box} />
      </div>
      <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 font-serif text-lg">
        {phase.exercise.prompt}
      </div>

      {phase.status === 'exercise' && (
        <>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (answer.trim()) {
                  submitAnswer();
                }
              }
            }}
            rows={3}
            className="mb-4 w-full resize-none rounded-2xl border border-border px-4 py-3"
            autoFocus
          />
          <button
            onClick={submitAnswer}
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
            <p className="text-sm">{phase.feedback}</p>
            <div className="mt-3 flex items-center gap-2">
              <BoxDots box={phase.previousBox} />
              <span className="text-ink-soft">→</span>
              <BoxDots box={phase.box} />
            </div>
          </div>
          <button
            onClick={fetchNext}
            className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
          >
            Next
          </button>
        </>
      )}
    </div>
  );
}
