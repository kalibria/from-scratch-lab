import { useLessonHub } from './use-lesson-hub.js';
import { Spinner } from '../components/Spinner.js';

type LessonHubProps = { onOpenLesson: (lessonId: number) => void; onDone: () => void };

const DONE_KEYS = ['vocabDone', 'grammarDone', 'writingDone', 'speakingDone', 'checkpointDone'] as const;

export function LessonHub({ onOpenLesson, onDone }: LessonHubProps) {
  const { phase, retry } = useLessonHub();

  if (phase.status === 'loading') {
    return <Spinner onExit={onDone} />;
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't load lessons.</p>
        <button onClick={retry} className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Retry
        </button>
        <button onClick={onDone} className="w-full text-sm text-ink-soft underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <button onClick={onDone} className="mb-4 text-sm text-ink-soft underline">
        Back to dashboard
      </button>
      <p className="mb-4 text-sm text-ink-soft">Lessons</p>
      <div className="flex flex-col gap-2">
        {phase.lessons.map((lesson) => {
          const doneCount = DONE_KEYS.filter((key) => lesson.progress[key]).length;

          return (
            <button
              key={lesson.id}
              onClick={() => onOpenLesson(lesson.id)}
              className="rounded-2xl border border-border bg-surface-soft px-4 py-3 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Lesson {lesson.number}: {lesson.title}
                </span>
                <span className="text-xs text-ink-soft">{doneCount}/5</span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                {lesson.level} · {lesson.sourceBook === 'ict_in_use' ? 'IT' : 'Business'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
