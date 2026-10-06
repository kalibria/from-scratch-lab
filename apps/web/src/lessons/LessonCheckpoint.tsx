import { useLessonCheckpoint } from './use-lesson-checkpoint.js';
import { Spinner } from '../components/Spinner.js';

type LessonCheckpointProps = { lessonId: number; onDone: () => void };

export function LessonCheckpoint({ lessonId, onDone }: LessonCheckpointProps) {
  const {
    phase,
    answer,
    setAnswer,
    reveal,
    gradeVocab,
    submitGrammar,
    nextStep,
    finish,
    retry,
    currentStep,
    totalItems,
  } = useLessonCheckpoint(lessonId);

  const finishAndExit = async () => {
    await finish();
    onDone();
  };

  if (phase.status === 'loading') {
    return <Spinner onExit={finishAndExit} />;
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't load the checkpoint.</p>
        <button onClick={retry} className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Retry
        </button>
        <button onClick={finishAndExit} className="w-full text-sm text-ink-soft underline">
          Back to lesson
        </button>
      </div>
    );
  }

  if (phase.status === 'summary') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">
          Checkpoint done — {phase.correctCount}/{totalItems} correct.
        </p>
        <button onClick={finishAndExit} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Back to lesson
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={finishAndExit} className="text-sm text-ink-soft underline">
          End checkpoint
        </button>
        <span className="text-xs text-ink-soft">
          {currentStep + 1} / {totalItems}
        </span>
      </div>

      {phase.status === 'vocab' && (
        <>
          <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 text-center font-serif text-xl">
            {phase.phrase.ruGloss}
          </div>
          {phase.revealed ? (
            <>
              <div className="mb-5 rounded-2xl bg-accent-soft px-5 py-6 text-center font-serif text-xl text-accent">
                {phase.phrase.enText}
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => gradeVocab('incorrect')}
                  className="flex-1 rounded-2xl border border-bad/30 bg-bad/15 px-4 py-3.5 font-semibold text-bad"
                >
                  ✗ Wrong
                </button>
                <button
                  onClick={() => gradeVocab('correct')}
                  className="flex-1 rounded-2xl border border-good/30 bg-good/15 px-4 py-3.5 font-semibold text-good"
                >
                  ✓ Right
                </button>
              </div>
            </>
          ) : (
            <button onClick={reveal} className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white">
              Show translation
            </button>
          )}
        </>
      )}

      {(phase.status === 'grammar' || phase.status === 'grammar-evaluating') && (
        <>
          <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 font-serif text-lg">
            {phase.exercise.prompt}
          </div>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={3}
            className="mb-4 w-full resize-none rounded-2xl border border-border px-4 py-3"
            autoFocus
            disabled={phase.status === 'grammar-evaluating'}
          />
          <button
            onClick={submitGrammar}
            disabled={!answer.trim() || phase.status === 'grammar-evaluating'}
            className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white disabled:opacity-50"
          >
            {phase.status === 'grammar-evaluating' ? 'Checking...' : 'Answer'}
          </button>
        </>
      )}

      {phase.status === 'grammar-feedback' && (
        <>
          <div
            className={`mb-4 rounded-2xl px-4 py-3.5 ${
              phase.verdict === 'correct' ? 'bg-good/15' : phase.verdict === 'close' ? 'bg-warn/15' : 'bg-bad/15'
            }`}
          >
            <p className="text-sm">{phase.feedback}</p>
          </div>
          <button onClick={nextStep} className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white">
            Next
          </button>
        </>
      )}
    </div>
  );
}
