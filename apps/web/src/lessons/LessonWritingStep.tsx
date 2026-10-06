import { useLessonWritingStep } from './use-lesson-writing-step.js';
import { Spinner } from '../components/Spinner.js';
import { MicButton } from '../components/MicButton.js';

type LessonWritingStepProps = { lessonId: number; onDone: () => void };

export function LessonWritingStep({ lessonId, onDone }: LessonWritingStepProps) {
  const { phase, answer, setAnswer, submit, finish, retry } = useLessonWritingStep(lessonId);

  const finishAndExit = async () => {
    await finish();
    onDone();
  };

  if (phase.status === 'loading') {
    return <Spinner message="Preparing your task..." onExit={finishAndExit} />;
  }

  if (phase.status === 'evaluating') {
    return <Spinner message="Checking your answer..." onExit={finishAndExit} />;
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't reach the agent.</p>
        <button onClick={retry} className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Retry
        </button>
        <button onClick={finishAndExit} className="w-full text-sm text-ink-soft underline">
          Back to lesson
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <button onClick={finishAndExit} className="mb-4 text-sm text-ink-soft underline">
        Back to lesson
      </button>
      <p className="mb-2 text-sm text-ink-soft">Writing task</p>
      <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 font-serif text-lg">
        {phase.prompt}
      </div>

      {phase.status === 'active' && (
        <>
          <div className="mb-4 flex items-start gap-2">
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-border px-4 py-3"
              autoFocus
            />
            <MicButton onTranscript={(text) => setAnswer((prev) => (prev ? `${prev} ${text}` : text))} />
          </div>
          <button
            onClick={submit}
            disabled={!answer.trim()}
            className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white disabled:opacity-50"
          >
            Submit
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
          </div>
          <button onClick={finishAndExit} className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white">
            Done
          </button>
        </>
      )}
    </div>
  );
}
