import { useState } from 'react';
import { apiFetch } from '../api-client.js';
import type { SuggestedPhrase } from '../types.js';

type Phase =
  | { status: 'input' }
  | { status: 'extracting' }
  | { status: 'review'; candidates: SuggestedPhrase[] }
  | { status: 'error' }
  | { status: 'done' };

export function useAddPhrase() {
  const [phase, setPhase] = useState<Phase>({ status: 'input' });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function extract(text: string) {
    setPhase({ status: 'extracting' });
    const res = await apiFetch('/phrases/extract', { method: 'POST', body: JSON.stringify({ text }) });

    if (!res.ok) {
      setPhase({ status: 'error' });
      return;
    }

    const data = await res.json();
    setSelected(new Set(data.phrases.map((p: SuggestedPhrase) => p.enText)));
    setPhase({ status: 'review', candidates: data.phrases });
  }

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
    if (phase.status !== 'review') {
      return;
    }

    const chosen = phase.candidates.filter((p) => selected.has(p.enText));
    await apiFetch('/phrases/bulk', { method: 'POST', body: JSON.stringify({ phrases: chosen }) });
    setPhase({ status: 'done' });
  }

  return { phase, selected, extract, toggle, confirm };
}
