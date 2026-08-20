import { useSessionSummary } from './use-session-summary.js';
import { buildPraiseMessage } from './build-praise-message.js';
import type { Session, SuggestedPhrase } from '../types.js';

type SessionSummaryProps = {
  session: Session;
  suggestedPhrases: SuggestedPhrase[];
  comebackPhrases: string[];
  onDone: () => void;
};

export function SessionSummary({ session, suggestedPhrases, comebackPhrases, onDone }: SessionSummaryProps) {
  const { stats, selected, toggle, confirm } = useSessionSummary(session, suggestedPhrases);

  async function handleDone() {
    await confirm();
    onDone();
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <div className="mb-6 rounded-2xl bg-accent-soft px-4 py-4">
        <p className="text-sm font-medium">
          {stats ? buildPraiseMessage({ comebackPhrases, streak: stats.currentStreak }) : 'Nice session.'}
        </p>
      </div>

      {suggestedPhrases.length > 0 && (
        <>
          <p className="mb-3 text-sm text-ink-soft">Worth adding to your deck:</p>
          <div className="mb-6 flex flex-col gap-2">
            {suggestedPhrases.map((p) => (
              <label
                key={p.enText}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface-soft px-4 py-3"
              >
                <input type="checkbox" checked={selected.has(p.enText)} onChange={() => toggle(p.enText)} />
                <span className="text-sm">
                  {p.enText}
                  {p.ruGloss ? ` — ${p.ruGloss}` : ''}
                </span>
              </label>
            ))}
          </div>
        </>
      )}

      <button onClick={handleDone} className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white">
        OK
      </button>
    </div>
  );
}
