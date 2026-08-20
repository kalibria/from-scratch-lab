import { useCountdown } from './use-countdown.js';
import { formatRemainingTime } from './format-remaining-time.js';

export function SessionTimer({ deadline }: { deadline: Date }) {
  const remainingMs = useCountdown(deadline);

  return (
    <span className="rounded-full border border-border bg-surface-soft px-3 py-1 text-sm tabular-nums text-ink-soft">
      {remainingMs > 0 ? formatRemainingTime(remainingMs) : "Time's up"}
    </span>
  );
}
