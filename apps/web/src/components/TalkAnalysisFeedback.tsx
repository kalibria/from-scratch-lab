import type { FreeTalkAnalysis } from '../free-talk-session/use-free-talk-session.js';

type TalkAnalysisFeedbackProps = { analysis: FreeTalkAnalysis };

export function TalkAnalysisFeedback({ analysis }: TalkAnalysisFeedbackProps) {
  return (
    <>
      {analysis.grammar && <Section title="Grammar" text={analysis.grammar} />}
      {analysis.naturalness && <Section title="Naturalness" text={analysis.naturalness} />}
      {analysis.fluency && <Section title="Fluency" text={analysis.fluency} />}

      {analysis.suggestedPhrases.length > 0 && (
        <div className="mb-5 rounded-2xl bg-accent-soft px-4 py-3.5">
          <p className="mb-2 text-sm font-semibold">Worth learning:</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {analysis.suggestedPhrases.map((p) => (
              <li key={p.enText}>
                <span>
                  {p.enText}
                  {p.ruGloss ? ` — ${p.ruGloss}` : ''}
                </span>
                {p.usageNote ? <span className="mt-0.5 block text-xs text-ink-soft">{p.usageNote}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
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
