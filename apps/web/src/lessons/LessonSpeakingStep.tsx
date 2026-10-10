import { useLessonSpeakingStep } from './use-lesson-speaking-step.js';
import { Spinner } from '../components/Spinner.js';
import { MicButton } from '../components/MicButton.js';
import { TalkAnalysisFeedback } from '../components/TalkAnalysisFeedback.js';
import { SuggestedPhrasesConfirm } from '../components/SuggestedPhrasesConfirm.js';

type LessonSpeakingStepProps = { lessonId: number; onDone: () => void };

export function LessonSpeakingStep({ lessonId, onDone }: LessonSpeakingStepProps) {
  const { phase, response, setResponse, submit, finish, retry } = useLessonSpeakingStep(lessonId);

  const finishAndExit = async () => {
    await finish();
    onDone();
  };

  if (phase.status === 'loading') {
    return <Spinner onExit={finishAndExit} />;
  }

  if (phase.status === 'analyzing') {
    return <Spinner message="Your virtual English teacher is processing your request..." onExit={finishAndExit} />;
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
        <p className="mb-4 text-sm text-ink-soft">Feedback</p>
        <TalkAnalysisFeedback analysis={phase.analysis} />
        <SuggestedPhrasesConfirm suggestedPhrases={phase.analysis.suggestedPhrases} source="lesson_speaking" />
        <button onClick={finishAndExit} className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <button onClick={finishAndExit} className="mb-4 text-sm text-ink-soft underline">
        Back to lesson
      </button>
      <p className="mb-2 text-sm text-ink-soft">Speak about this</p>
      <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 font-serif text-lg">
        {phase.prompt}
      </div>
      <div className="mb-4 flex items-start gap-2">
        <textarea
          value={response}
          onChange={(event) => setResponse(event.target.value)}
          rows={5}
          className="w-full resize-none rounded-2xl border border-border px-4 py-3"
          autoFocus
        />
        <MicButton onTranscript={(text) => setResponse((prev) => (prev ? `${prev} ${text}` : text))} />
      </div>
      <button
        onClick={submit}
        disabled={!response.trim()}
        className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
