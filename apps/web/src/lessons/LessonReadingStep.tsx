import { useLessonReadingStep } from './use-lesson-reading-step.js';
import { Spinner } from '../components/Spinner.js';
import { MicButton } from '../components/MicButton.js';
import { SuggestedPhrasesConfirm } from '../components/SuggestedPhrasesConfirm.js';

type LessonReadingStepProps = { lessonId: number; onDone: () => void };

export function LessonReadingStep({ lessonId, onDone }: LessonReadingStepProps) {
  const { phase, utterance, setUtterance, startDiscussing, submitTurn, continueOrFinish, finish, retry } =
    useLessonReadingStep(lessonId);

  const finishAndExit = async () => {
    await finish();
    onDone();
  };

  if (phase.status === 'loading') {
    return <Spinner message="Writing your article..." onExit={finishAndExit} />;
  }

  if (phase.status === 'evaluating') {
    return <Spinner message="Listening..." onExit={finishAndExit} />;
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't reach the agent.</p>
        <button onClick={retry} className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Start over
        </button>
        <button onClick={finishAndExit} className="w-full text-sm text-ink-soft underline">
          Back to lesson
        </button>
      </div>
    );
  }

  if (phase.status === 'done') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Nice discussion!</p>
        <button onClick={onDone} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Back to lesson
        </button>
      </div>
    );
  }

  if (phase.status === 'reading') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <button onClick={finishAndExit} className="mb-4 text-sm text-ink-soft underline">
          Back to lesson
        </button>
        <p className="mb-2 text-sm text-ink-soft">Read this, then we'll discuss it</p>
        <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 font-serif text-lg">
          {phase.text}
        </div>
        <button
          onClick={startDiscussing}
          className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
        >
          I'm ready to discuss
        </button>
      </div>
    );
  }

  if (phase.status === 'responding') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <button onClick={finishAndExit} className="mb-4 text-sm text-ink-soft underline">
          Back to lesson
        </button>
        <div className="mb-4 flex items-start gap-2">
          <textarea
            value={utterance}
            onChange={(event) => setUtterance(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (utterance.trim()) {
                  submitTurn();
                }
              }
            }}
            rows={4}
            className="w-full resize-none rounded-2xl border border-border px-4 py-3"
            autoFocus
          />
          <MicButton onTranscript={(text) => setUtterance((prev) => (prev ? `${prev} ${text}` : text))} />
        </div>
        <button
          onClick={submitTurn}
          disabled={!utterance.trim()}
          className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    );
  }

  const { latest } = phase;

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <button onClick={finishAndExit} className="mb-4 text-sm text-ink-soft underline">
        Back to lesson
      </button>
      {latest.feedback || latest.corrections.length > 0 ? (
        <div className="mb-4 rounded-2xl bg-good/15 px-4 py-3.5">
          {latest.feedback && <p className="text-sm">{latest.feedback}</p>}
          {latest.corrections.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {latest.corrections.map((c, index) => (
                <li key={index}>
                  <span className="text-bad line-through">{c.mistake}</span> → <span className="text-good">{c.fix}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-4 py-3.5 text-sm">{latest.reply}</div>
      <SuggestedPhrasesConfirm suggestedPhrases={latest.suggestedPhrases} source="lesson_reading" />
      <button onClick={continueOrFinish} className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white">
        {latest.done ? 'Finish' : 'Reply'}
      </button>
    </div>
  );
}
