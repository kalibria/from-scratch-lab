import { useSuggestedPhrases } from './use-suggested-phrases.js';
import type { LessonPhraseSource } from './use-suggested-phrases.js';
import type { SuggestedPhrase } from '../types.js';

type SuggestedPhrasesConfirmProps = { suggestedPhrases: SuggestedPhrase[]; source: LessonPhraseSource };

export function SuggestedPhrasesConfirm({ suggestedPhrases, source }: SuggestedPhrasesConfirmProps) {
  const { selected, toggle, confirm, confirmed } = useSuggestedPhrases(suggestedPhrases, source);

  if (suggestedPhrases.length === 0) {
    return null;
  }

  if (confirmed) {
    return <p className="mb-4 text-sm text-good">Added to your flashcards.</p>;
  }

  return (
    <>
      <p className="mb-2 text-sm text-ink-soft">Worth adding to your deck:</p>
      <div className="mb-3 flex flex-col gap-2">
        {suggestedPhrases.map((p) => (
          <label
            key={p.enText}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface-soft px-4 py-3"
          >
            <input type="checkbox" checked={selected.has(p.enText)} onChange={() => toggle(p.enText)} />
            <span className="text-sm">
              <span>
                {p.enText}
                {p.ruGloss ? ` — ${p.ruGloss}` : ''}
              </span>
              {p.usageNote ? <span className="mt-0.5 block text-xs text-ink-soft">{p.usageNote}</span> : null}
            </span>
          </label>
        ))}
      </div>
      <button
        onClick={confirm}
        className="mb-4 w-full rounded-2xl border border-accent px-4 py-2.5 text-sm font-semibold text-accent"
      >
        Add to flashcards
      </button>
    </>
  );
}
