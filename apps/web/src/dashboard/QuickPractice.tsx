import { useState } from 'react';
import { usePhraseCategories } from './use-phrase-categories.js';
import { startSession } from './start-session.js';
import type { Session, SessionMode, StudyTopic } from '../types.js';

type QuickPracticeProps = {
  onStartSession: (session: Session, mode: SessionMode, topics: StudyTopic[]) => void;
  onOpenRecitation: () => void;
  onOpenGrammar: () => void;
  onOpenBrowse: (topics: StudyTopic[]) => void;
  onDone: () => void;
};

const BUILT_IN_TOPIC_OPTIONS: { value: StudyTopic; label: string }[] = [
  { value: 'collocation', label: 'Collocations' },
  { value: 'phrasal_verb', label: 'Phrasal verbs' },
  { value: 'idiom', label: 'Idioms' },
  { value: 'free_talk', label: 'From free-talk' },
  { value: 'lesson_feedback', label: 'From lessons' },
];

type QuickMode = 'free-talk' | 'drill' | 'flashcards';

const MODE_OPTIONS: { value: QuickMode; label: string; description: string }[] = [
  { value: 'free-talk', label: 'Just talk', description: 'Speak freely on a topic, get feedback' },
  { value: 'drill', label: 'Just practice', description: 'Translate phrases, get corrected' },
  { value: 'flashcards', label: 'Flashcards', description: 'Self-graded, instant review' },
];

export function QuickPractice({ onStartSession, onOpenRecitation, onOpenGrammar, onOpenBrowse, onDone }: QuickPracticeProps) {
  const categories = usePhraseCategories();
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [mode, setMode] = useState<QuickMode | undefined>(undefined);

  const builtInValues = new Set(BUILT_IN_TOPIC_OPTIONS.map((option) => option.value));
  const extraOptions = categories
    .filter((category) => !builtInValues.has(category) && !category.startsWith('lesson-'))
    .map((category) => ({ value: category, label: category }));
  const topicOptions = [...BUILT_IN_TOPIC_OPTIONS, ...extraOptions];

  function toggleTopic(topic: StudyTopic) {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  async function handleStart() {
    if (!mode) return;

    if (mode === 'flashcards') {
      onOpenBrowse(topics);
      return;
    }

    const session = await startSession(15);
    onStartSession(session, mode, topics);
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <button onClick={onDone} className="mb-4 text-sm text-ink-soft underline">
        Back to dashboard
      </button>
      <p className="mb-5 text-lg font-semibold">Quick practice</p>

      <p className="mb-2 text-sm text-ink-soft">Focus on (optional):</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {topicOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleTopic(option.value)}
            aria-pressed={topics.includes(option.value)}
            className={`rounded-full border px-3.5 py-2 text-sm font-medium ${
              topics.includes(option.value)
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-border text-ink-soft'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="mb-2 text-sm text-ink-soft">What do you want to practice?</p>
      <div className="mb-5 flex flex-col gap-2">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            aria-pressed={mode === option.value}
            className={`w-full rounded-2xl border px-4 py-3 text-left ${
              mode === option.value ? 'border-accent bg-accent-soft' : 'border-border'
            }`}
          >
            <span className={`block font-semibold ${mode === option.value ? 'text-accent' : ''}`}>
              {option.label}
            </span>
            <span className="block text-xs text-ink-soft">{option.description}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={!mode}
        className="mb-6 w-full rounded-2xl bg-accent px-4 py-4 text-center font-semibold text-white disabled:opacity-40"
      >
        Start session
      </button>

      <p className="mb-2 text-sm text-ink-soft">Or jump straight into:</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenRecitation}
          className="rounded-2xl border border-border px-4 py-3 text-center text-sm font-medium"
        >
          Recite a text
        </button>
        <button
          onClick={onOpenGrammar}
          className="rounded-2xl border border-border px-4 py-3 text-center text-sm font-medium"
        >
          Practice grammar
        </button>
      </div>
    </div>
  );
}
