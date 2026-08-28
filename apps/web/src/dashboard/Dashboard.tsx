import { useState } from 'react';
import { useStats } from './use-stats.js';
import { startSession } from './start-session.js';
import { StatCard } from '../components/StatCard.js';
import { Spinner } from '../components/Spinner.js';
import type { Session, SessionMode, StudyTopic } from '../types.js';

type DashboardProps = {
  onStartSession: (session: Session, mode: SessionMode, topics: StudyTopic[]) => void;
  onOpenAgentDashboard: () => void;
  onAddPhrase: () => void;
};

const TOPIC_OPTIONS: { value: StudyTopic; label: string }[] = [
  { value: 'collocation', label: 'Collocations' },
  { value: 'phrasal_verb', label: 'Phrasal verbs' },
  { value: 'idiom', label: 'Idioms' },
  { value: 'free_talk', label: 'From free-talk' },
];

export function Dashboard({ onStartSession, onOpenAgentDashboard, onAddPhrase }: DashboardProps) {
  const { phase, retry } = useStats();
  const [topics, setTopics] = useState<StudyTopic[]>([]);

  if (phase.status === 'loading') {
    return <Spinner />;
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't load your stats.</p>
        <button onClick={retry} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Retry
        </button>
      </div>
    );
  }

  const { stats } = phase;

  function toggleTopic(topic: StudyTopic) {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  async function handleStart(mode: SessionMode) {
    const session = await startSession(15);
    onStartSession(session, mode, topics);
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <div className="mb-6 flex items-baseline gap-2.5">
        <span className="font-serif text-4xl text-accent">{stats.currentStreak}</span>
        <span className="text-sm text-ink-soft">day streak</span>
      </div>

      <div className="flex flex-col gap-2.5">
        <StatCard label="Due for review" value={stats.phrasesDue} />
        <StatCard label="Learned" value={stats.phrasesMastered} />
        <StatCard label="Still learning" value={stats.phrasesRemaining} />
        <StatCard label="Days practiced" value={stats.daysPracticed} />
        <StatCard label="Total hours" value={(stats.totalMinutes / 60).toFixed(1)} />
      </div>

      <p className="mt-6 mb-2 text-sm text-ink-soft">Focus on (optional):</p>
      <div className="flex flex-wrap gap-2">
        {TOPIC_OPTIONS.map((option) => (
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
        className="mt-4 w-full rounded-2xl bg-accent px-4 py-4 text-center font-semibold text-white"
      >
        Start session
        <span className="block text-xs font-normal opacity-85">15 minutes · talk + practice</span>
      </button>

      <div className="mt-2.5 flex gap-2.5">
        <button
          onClick={() => handleStart('free-talk')}
          className="flex-1 rounded-2xl border border-border px-4 py-3 text-center text-sm font-medium"
        >
          Just talk
        </button>
        <button
          onClick={() => handleStart('drill')}
          className="flex-1 rounded-2xl border border-border px-4 py-3 text-center text-sm font-medium"
        >
          Just practice
        </button>
      </div>

      <button onClick={onAddPhrase} className="mt-3.5 w-full text-center text-sm text-ink-soft underline">
        Add phrase manually
      </button>

      <button onClick={onOpenAgentDashboard} className="mt-8 block w-full text-center text-xs text-ink-soft/70">
        Agent stats
      </button>
    </div>
  );
}
