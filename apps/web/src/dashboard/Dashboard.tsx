import { useStats } from './use-stats.js';
import { startSession } from './start-session.js';
import { StatCard } from '../components/StatCard.js';
import { Spinner } from '../components/Spinner.js';
import type { Session } from '../types.js';

type DashboardProps = {
  onStartSession: (session: Session) => void;
  onOpenAgentDashboard: () => void;
  onAddPhrase: () => void;
};

export function Dashboard({ onStartSession, onOpenAgentDashboard, onAddPhrase }: DashboardProps) {
  const stats = useStats();

  if (!stats) {
    return <Spinner />;
  }

  async function handleStart() {
    const session = await startSession(15);
    onStartSession(session);
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

      <button
        onClick={handleStart}
        className="mt-6 w-full rounded-2xl bg-accent px-4 py-4 text-center font-semibold text-white"
      >
        Start session
        <span className="block text-xs font-normal opacity-85">15 minutes</span>
      </button>

      <button onClick={onAddPhrase} className="mt-3.5 w-full text-center text-sm text-ink-soft underline">
        Add phrase manually
      </button>

      <button onClick={onOpenAgentDashboard} className="mt-8 block w-full text-center text-xs text-ink-soft/70">
        Agent stats
      </button>
    </div>
  );
}
