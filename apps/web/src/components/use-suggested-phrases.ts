import { useState } from 'react';
import { apiFetch } from '../api-client.js';
import type { SuggestedPhrase } from '../types.js';

export type LessonPhraseSource = 'lesson_writing' | 'lesson_speaking' | 'grammar_feedback';

export function useSuggestedPhrases(suggestedPhrases: SuggestedPhrase[], source: LessonPhraseSource) {
  const [selected, setSelected] = useState<Set<string>>(new Set(suggestedPhrases.map((p) => p.enText)));
  const [confirmed, setConfirmed] = useState(false);

  function toggle(enText: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(enText)) {
        next.delete(enText);
      } else {
        next.add(enText);
      }
      return next;
    });
  }

  async function confirm() {
    const chosen = suggestedPhrases.filter((p) => selected.has(p.enText));

    if (chosen.length > 0) {
      await apiFetch('/phrases/confirm', {
        method: 'POST',
        body: JSON.stringify({ phrases: chosen, source }),
      });
    }

    setConfirmed(true);
  }

  return { selected, toggle, confirm, confirmed };
}
