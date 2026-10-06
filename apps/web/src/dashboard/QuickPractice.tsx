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
];

export function QuickPractice({ onStartSession, onOpenRecitation, onOpenGrammar, onOpenBrowse, onDone }: QuickPracticeProps) {
  const categories = usePhraseCategories();
  const [topics, setTopics] = useState<StudyTopic[]>([]);

  const builtInValues = new Set(BUILT_IN_TOPIC_OPTIONS.map((option) => option.value));
  const extraOptions = categories
    .filter((category) => !builtInValues.has(category) && !category.startsWith('lesson-'))
    .map((category) => ({ value: category, label: category }));
  const topicOptions = [...BUILT_IN_TOPIC_OPTIONS, ...extraOptions];

  function toggleTopic(topic: StudyTopic) {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  async function handleStart(mode: SessionMode) {
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

      <button
        onClick={() => handleStart('combined')}
        className="mb-2.5 w-full rounded-2xl bg-accent px-4 py-4 text-center font-semibold text-white"
      >
        Start session
        <span className="block text-xs font-normal opacity-85">15 minutes · talk + practice</span>
      </button>

      <div className="mb-2.5 grid grid-cols-3 gap-2">
        <button
          onClick={() => handleStart('free-talk')}
          className="rounded-2xl border border-border px-3 py-3 text-center text-sm font-medium"
        >
          Just talk
        </button>
        <button
          onClick={() => handleStart('drill')}
          className="rounded-2xl border border-border px-3 py-3 text-center text-sm font-medium"
        >
          Just practice
        </button>
        <button
          onClick={() => onOpenBrowse(topics)}
          className="rounded-2xl border border-border px-3 py-3 text-center text-sm font-medium"
        >
          Flashcards
        </button>
      </div>

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
