import { useLessonDetail } from './use-lesson-detail.js';
import { Spinner } from '../components/Spinner.js';

type LessonDetailProps = {
  lessonId: number;
  onOpenVocab: (vocabCategory: string, lessonId: number) => void;
  onOpenGrammar: (topicId: number, lessonId: number) => void;
  onOpenWriting: (lessonId: number) => void;
  onOpenSpeaking: (lessonId: number) => void;
  onOpenCheckpoint: (lessonId: number) => void;
  onDone: () => void;
};

export function LessonDetail({
  lessonId,
  onOpenVocab,
  onOpenGrammar,
  onOpenWriting,
  onOpenSpeaking,
  onOpenCheckpoint,
  onDone,
}: LessonDetailProps) {
  const { phase, retry } = useLessonDetail(lessonId);

  if (phase.status === 'loading') {
    return <Spinner onExit={onDone} />;
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't load this lesson.</p>
        <button onClick={retry} className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Retry
        </button>
        <button onClick={onDone} className="w-full text-sm text-ink-soft underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  const { lesson } = phase;

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <button onClick={onDone} className="mb-4 text-sm text-ink-soft underline">
        Back to lessons
      </button>
      <p className="mb-1 text-xs text-ink-soft">
        {lesson.level} · Lesson {lesson.number}
      </p>
      <h1 className="mb-5 font-serif text-xl">{lesson.title}</h1>

      <div className="flex flex-col gap-2.5">
        <StepCard
          label="Vocabulary"
          description={lesson.vocabTheme}
          done={lesson.progress.vocabDone}
          onClick={() => onOpenVocab(lesson.vocabCategory, lesson.id)}
        />
        <StepCard
          label="Grammar"
          description={lesson.grammarTopicName}
          done={lesson.progress.grammarDone}
          onClick={() => onOpenGrammar(lesson.grammarTopicId, lesson.id)}
        />
        <StepCard
          label="Writing task"
          description="Write a short response, typed or spoken"
          done={lesson.progress.writingDone}
          onClick={() => onOpenWriting(lesson.id)}
        />
        <StepCard
          label="Speaking"
          description={lesson.speakingPrompt}
          done={lesson.progress.speakingDone}
          onClick={() => onOpenSpeaking(lesson.id)}
        />
        <StepCard
          label="Checkpoint"
          description={
            lesson.progress.checkpointScore !== null
              ? `Last score: ${lesson.progress.checkpointScore}/6`
              : 'Mixed vocabulary + grammar check'
          }
          done={lesson.progress.checkpointDone}
          onClick={() => onOpenCheckpoint(lesson.id)}
        />
      </div>
    </div>
  );
}

type StepCardProps = { label: string; description: string; done: boolean; onClick: () => void };

function StepCard({ label, description, done, onClick }: StepCardProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3.5 text-left ${
        done ? 'border-good/30 bg-good/10' : 'border-border bg-surface-soft'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        {done && <span className="text-xs text-good">✓ Done</span>}
      </div>
      <p className="mt-1 text-xs text-ink-soft">{description}</p>
    </button>
  );
}
