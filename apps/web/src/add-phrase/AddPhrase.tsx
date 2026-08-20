import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAddPhrase } from './use-add-phrase.js';

type AddPhraseProps = { onDone: () => void };

export function AddPhrase({ onDone }: AddPhraseProps) {
  const { phase, selected, extract, toggle, confirm } = useAddPhrase();
  const [text, setText] = useState('');

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setText(await file.text());
  }

  if (phase.status === 'done') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Added.</p>
        <button onClick={onDone} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't reach the agent.</p>
        <button
          onClick={() => extract(text)}
          className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
        >
          Retry
        </button>
        <button onClick={onDone} className="w-full text-sm text-ink-soft underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (phase.status === 'review') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <p className="mb-3 text-sm text-ink-soft">Found phrases:</p>
        <div className="mb-6 flex flex-col gap-2">
          {phase.candidates.map((p) => (
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
          onClick={async () => {
            await confirm();
          }}
          className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
        >
          Add
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <p className="mb-2 text-sm text-ink-soft">Paste text or a list of phrases</p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={8}
        className="mb-3 w-full rounded-2xl border border-border px-4 py-3"
        autoFocus
      />
      <input type="file" accept=".txt" onChange={handleFile} className="mb-4 text-sm text-ink-soft" />
      <button
        onClick={() => extract(text)}
        disabled={phase.status === 'extracting' || !text.trim()}
        className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white disabled:opacity-50"
      >
        {phase.status === 'extracting' ? 'Analyzing...' : 'Extract'}
      </button>
    </div>
  );
}
