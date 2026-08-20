import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';
import type { Session, SuggestedPhrase } from '../types.js';
import type { Stats } from '../dashboard/use-stats.js';

export function useSessionSummary(session: Session, suggestedPhrases: SuggestedPhrase[]) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState(new Set(suggestedPhrases.map((p) => p.enText)));

  useEffect(() => {
    async function finalize() {
      await apiFetch(`/sessions/${session.id}/end`, { method: 'PATCH' });
      const res = await apiFetch('/stats');
      setStats(await res.json());
    }
    finalize();
  }, []);

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
      await apiFetch('/free-talk/confirm-phrases', {
        method: 'POST',
        body: JSON.stringify({ sessionId: session.id, phrases: chosen }),
      });
    }
  }

  return { stats, selected, toggle, confirm };
}
