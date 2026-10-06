import { useStats } from './use-stats.js';
import { StatCard } from '../components/StatCard.js';
import { Spinner } from '../components/Spinner.js';

type DashboardProps = {
  onOpenAgentDashboard: () => void;
  onAddPhrase: () => void;
  onOpenLessons: () => void;
  onOpenQuickPractice: () => void;
};

export function Dashboard({ onOpenAgentDashboard, onAddPhrase, onOpenLessons, onOpenQuickPractice }: DashboardProps) {
  const { phase, retry } = useStats();

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

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <div className="mb-5 flex items-baseline gap-2.5">
        <span className="font-serif text-4xl text-accent">{stats.currentStreak}</span>
        <span className="text-sm text-ink-soft">day streak</span>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-2">
        <StatCard label="Due" value={stats.phrasesDue} />
        <StatCard label="Learned" value={stats.phrasesMastered} />
        <StatCard label="Still learning" value={stats.phrasesRemaining} />
        <StatCard label="Days" value={stats.daysPracticed} />
        <StatCard label="Hours" value={(stats.totalMinutes / 60).toFixed(1)} />
      </div>

      <button
        onClick={onOpenLessons}
        className="w-full rounded-2xl bg-accent px-4 py-5 text-center text-lg font-semibold text-white"
      >
        Lessons
        <span className="mt-1 block text-xs font-normal opacity-85">
          structured units: vocab, grammar, writing, speaking
        </span>
      </button>

      <button
        onClick={onOpenQuickPractice}
        className="mt-2.5 w-full rounded-2xl border border-border bg-surface-soft px-4 py-5 text-center text-lg font-semibold"
      >
        Quick practice
        <span className="mt-1 block text-xs font-normal text-ink-soft">
          flashcards, free talk, grammar, recitation
        </span>
      </button>

      <button onClick={onAddPhrase} className="mt-5 w-full text-center text-sm text-ink-soft underline">
        Add phrase manually
      </button>

      <button onClick={onOpenAgentDashboard} className="mt-8 block w-full text-center text-xs text-ink-soft/70">
        Agent stats
      </button>
    </div>
  );
}
