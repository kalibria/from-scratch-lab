import { useLessonVideoStep } from './use-lesson-video-step.js';
import { Spinner } from '../components/Spinner.js';
import { MicButton } from '../components/MicButton.js';
import { SuggestedPhrasesConfirm } from '../components/SuggestedPhrasesConfirm.js';

type LessonVideoStepProps = { lessonId: number; onDone: () => void };

export function LessonVideoStep({ lessonId, onDone }: LessonVideoStepProps) {
  const { phase, reflection, setReflection, submit, finish, retry } = useLessonVideoStep(lessonId);

  const finishAndExit = async () => {
    await finish();
    onDone();
  };

  if (phase.status === 'loading') {
    return <Spinner onExit={finishAndExit} />;
  }

  if (phase.status === 'extracting') {
    return <Spinner message="Looking for phrases worth learning..." onExit={finishAndExit} />;
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

  if (phase.status === 'feedback') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <button onClick={finishAndExit} className="mb-4 text-sm text-ink-soft underline">
          Back to lesson
        </button>
        <p className="mb-4 text-sm text-ink-soft">Nice watching!</p>
        <SuggestedPhrasesConfirm suggestedPhrases={phase.suggestedPhrases} source="lesson_video" />
        <button onClick={finishAndExit} className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white">
          Done
        </button>
      </div>
    );
  }

  if (!phase.videoUrl) {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">No video linked for this lesson yet.</p>
        <button onClick={finishAndExit} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
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
      <p className="mb-2 text-sm text-ink-soft">Watch this, then tell us what you learned</p>
      <a
        href={phase.videoUrl}
        target="_blank"
        rel="noreferrer"
        className="mb-5 block rounded-2xl border border-border bg-surface-soft px-5 py-6 font-serif text-lg text-accent underline"
      >
        {phase.videoTitle ?? 'Watch on YouTube'}
      </a>
      <p className="mb-2 text-sm text-ink-soft">What stood out? Any new words or phrases?</p>
      <div className="mb-4 flex items-start gap-2">
        <textarea
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          rows={5}
          className="w-full resize-none rounded-2xl border border-border px-4 py-3"
          autoFocus
        />
        <MicButton onTranscript={(text) => setReflection((prev) => (prev ? `${prev} ${text}` : text))} />
      </div>
      <button
        onClick={submit}
        disabled={!reflection.trim()}
        className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white disabled:opacity-50"
      >
        Submit
      </button>
    </div>
  );
}
