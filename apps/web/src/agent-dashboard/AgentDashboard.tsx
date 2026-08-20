import { useAgentStats } from './use-agent-stats.js';
import { StatCard } from '../components/StatCard.js';
import { Spinner } from '../components/Spinner.js';

type AgentDashboardProps = { onBack: () => void };

export function AgentDashboard({ onBack }: AgentDashboardProps) {
  const stats = useAgentStats();

  if (!stats) {
    return <Spinner />;
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <button onClick={onBack} className="mb-6 text-sm text-ink-soft underline">
        Back
      </button>

      <div className="mb-6 flex flex-col gap-2.5">
        <StatCard label="Total calls" value={stats.totalCalls} />
        <StatCard label="Total tokens" value={stats.totalTokens} />
        <StatCard label="Errors" value={stats.errorCount} />
      </div>

      <p className="mb-3 text-sm text-ink-soft">By function</p>
      <div className="flex flex-col gap-2">
        {stats.byFunction.map((f) => (
          <div key={f.functionName} className="rounded-2xl border border-border bg-surface-soft px-4 py-3">
            <p className="mb-1 text-sm font-semibold">{f.functionName}</p>
            <p className="text-xs text-ink-soft">
              {f.calls} calls · {f.tokens} tokens · {f.avgLatencyMs}ms avg · {f.errors} errors
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
