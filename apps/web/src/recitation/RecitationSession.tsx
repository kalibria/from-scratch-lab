import { useState } from 'react';
import { useRecitationSession } from './use-recitation-session.js';
import { usePhraseCategories } from '../dashboard/use-phrase-categories.js';
import { Spinner } from '../components/Spinner.js';
import { MicButton } from '../components/MicButton.js';

type RecitationSessionProps = { onDone: () => void };

const TOPIC_OPTIONS = [
  { value: 'giving a standup update to the team', label: 'Standup update' },
  { value: 'small talk with a colleague before a meeting', label: 'Small talk' },
  { value: 'giving a status update to your manager', label: 'Status update' },
  { value: 'asking a colleague for help with something', label: 'Asking for help' },
];

export function RecitationSession({ onDone }: RecitationSessionProps) {
  const { phase, utterance, setUtterance, generate, startListening, submitTurn, continueOrFinish, reset } =
    useRecitationSession();
  const categories = usePhraseCategories();
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);

  if (phase.status === 'setup') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <p className="mb-2 text-sm text-ink-soft">Topic (optional)</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((option) => (
            <Pill
              key={option.value}
              active={topic === option.value}
              onClick={() => setTopic((prev) => (prev === option.value ? undefined : option.value))}
            >
              {option.label}
            </Pill>
          ))}
        </div>

        <p className="mb-2 text-sm text-ink-soft">Pull phrases from (optional)</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Pill key={c} active={category === c} onClick={() => setCategory((prev) => (prev === c ? undefined : c))}>
              {c}
            </Pill>
          ))}
        </div>

        <button
          onClick={() => generate(topic, category)}
          className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
        >
          Generate a text
        </button>
        <button onClick={onDone} className="mt-3 w-full text-center text-sm text-ink-soft underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (phase.status === 'generating') {
    return <Spinner message="Writing your text..." />;
  }

  if (phase.status === 'evaluating') {
    return <Spinner message="Listening..." />;
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't reach the agent.</p>
        <button onClick={reset} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Start over
        </button>
      </div>
    );
  }

  if (phase.status === 'done') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Nice practice!</p>
        <button onClick={onDone} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (phase.status === 'memorize') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <p className="mb-2 text-sm text-ink-soft">Memorize this, then recite it in your own words</p>
        <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 font-serif text-lg">
          {phase.text.content}
        </div>
        <button
          onClick={startListening}
          className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
        >
          I'm ready to recite
        </button>
      </div>
    );
  }

  if (phase.status === 'listening') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <p className="mb-2 text-sm text-ink-soft">Recite it in your own words</p>
        <div className="mb-4 flex items-start gap-2">
          <textarea
            value={utterance}
            onChange={(event) => setUtterance(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (utterance.trim()) {
                  submitTurn();
                }
              }
            }}
            rows={4}
            className="w-full resize-none rounded-2xl border border-border px-4 py-3"
            autoFocus
          />
          <MicButton onTranscript={(text) => setUtterance((prev) => (prev ? `${prev} ${text}` : text))} />
        </div>
        <button
          onClick={submitTurn}
          disabled={!utterance.trim()}
          className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    );
  }

  const { latest } = phase;

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <div className="mb-4 rounded-2xl bg-good/15 px-4 py-3.5">
        {latest.feedback && <p className="text-sm">{latest.feedback}</p>}
        {latest.corrections.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {latest.corrections.map((c, index) => (
              <li key={index}>
                <span className="text-bad line-through">{c.mistake}</span> → <span className="text-good">{c.fix}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-4 py-3.5 text-sm">{latest.reply}</div>
      <button
        onClick={continueOrFinish}
        className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
      >
        {latest.done ? 'Finish' : 'Reply'}
      </button>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-2 text-sm font-medium ${
        active ? 'border-accent bg-accent-soft text-accent' : 'border-border text-ink-soft'
      }`}
    >
      {children}
    </button>
  );
}
