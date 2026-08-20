import { useFreeTalkSession } from './use-free-talk-session.js';
import { useCountdown } from '../components/use-countdown.js';
import { formatSpeakingTimer } from '../components/format-speaking-timer.js';
import { SessionTimer } from '../components/SessionTimer.js';
import { Spinner } from '../components/Spinner.js';
import { getSessionDeadline } from '../session-deadline.js';
import type { Session, SuggestedPhrase } from '../types.js';

type FreeTalkSessionProps = { session: Session; onComplete: (suggestedPhrases: SuggestedPhrase[]) => void };

export function FreeTalkSession({ session, onComplete }: FreeTalkSessionProps) {
  const { phase, response, setResponse, answerDeadline, startAnswering, submitResponse, retry } =
    useFreeTalkSession(session);
  const answerRemainingMs = useCountdown(answerDeadline);
  const speakingTimer = formatSpeakingTimer(answerRemainingMs);

  if (phase.status === 'loading') {
    return <Spinner message="Getting your topic ready..." />;
  }

  if (phase.status === 'analyzing') {
    return <Spinner message="Your virtual English teacher is processing your request..." />;
  }

  if (phase.status === 'no-response') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Didn't catch anything that time — no worries.</p>
        <button onClick={retry} className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Try a new topic
        </button>
        <button onClick={() => onComplete([])} className="w-full text-sm text-ink-soft underline">
          Skip and go to drill
        </button>
      </div>
    );
  }

  if (phase.status === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't reach the agent.</p>
        <button onClick={retry} className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Retry
        </button>
        <button onClick={() => onComplete([])} className="w-full text-sm text-ink-soft underline">
          Skip and go to drill
        </button>
      </div>
    );
  }

  if (phase.status === 'reading') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <div className="mb-4">
          <SessionTimer deadline={getSessionDeadline(session)} />
        </div>

        <p className="mb-2 text-sm text-ink-soft">Read the topic, then start speaking when you're ready</p>
        <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 font-serif text-lg">
          {phase.prompt}
        </div>
        <button
          onClick={startAnswering}
          className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
        >
          Start speaking (90s)
        </button>
      </div>
    );
  }

  if (phase.status === 'answering') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <div className="mb-4 flex items-center justify-between">
          <SessionTimer deadline={getSessionDeadline(session)} />
          <span
            className={`rounded-full border px-3 py-1 text-sm tabular-nums ${
              speakingTimer.isOvertime
                ? 'border-warn/30 bg-warn/15 text-warn'
                : 'border-accent/30 bg-accent-soft text-accent'
            }`}
          >
            {speakingTimer.text}
          </span>
        </div>
        {speakingTimer.isOvertime && (
          <p className="mb-4 text-xs text-warn">
            You're past the target time — that's fine for practice, just wrap up when you're ready.
          </p>
        )}

        <p className="mb-2 text-sm text-ink-soft">Tell me about it in your own words</p>
        <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 font-serif text-lg">
          {phase.prompt}
        </div>
        <textarea
          value={response}
          onChange={(event) => setResponse(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submitResponse();
            }
          }}
          rows={5}
          className="mb-4 w-full rounded-2xl border border-border px-4 py-3"
          autoFocus
        />
        <button
          onClick={() => submitResponse()}
          className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
        >
          Send
        </button>
      </div>
    );
  }

  const { analysis } = phase;

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <div className="mb-4">
        <SessionTimer deadline={getSessionDeadline(session)} />
      </div>

      <p className="mb-4 text-sm text-ink-soft">Feedback</p>

      {analysis.grammar && <Section title="Grammar" text={analysis.grammar} />}
      {analysis.naturalness && <Section title="Naturalness" text={analysis.naturalness} />}
      {analysis.fluency && <Section title="Fluency" text={analysis.fluency} />}

      {analysis.suggestedPhrases.length > 0 && (
        <div className="mb-5 rounded-2xl bg-accent-soft px-4 py-3.5">
          <p className="mb-2 text-sm font-semibold">Worth learning:</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {analysis.suggestedPhrases.map((p) => (
              <li key={p.enText}>
                {p.enText}
                {p.ruGloss ? ` — ${p.ruGloss}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => onComplete(analysis.suggestedPhrases)}
        className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
      >
        Next
      </button>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-3 rounded-2xl border border-border bg-surface-soft px-4 py-3.5">
      <p className="mb-1 text-xs font-semibold tracking-wide text-ink-soft uppercase">{title}</p>
      <p className="text-sm">{text}</p>
    </div>
  );
}
