import { useBrowseSession } from './use-browse-session.js';
import { SessionTimer } from '../components/SessionTimer.js';
import { Spinner } from '../components/Spinner.js';
import { BoxDots } from '../components/BoxDots.js';
import { getSessionDeadline } from '../session-deadline.js';
import type { StudyTopic } from '../types.js';

type BrowseSessionProps = { topics: StudyTopic[]; onDone: () => void };

export function BrowseSession({ topics, onDone }: BrowseSessionProps) {
  const {
    phase,
    session,
    phrase,
    revealed,
    timerDisabled,
    reviewedCount,
    start,
    reveal,
    grade,
    continueWithoutTimer,
    finish,
  } = useBrowseSession(topics);

  const finishAndExit = async () => {
    await finish();
    onDone();
  };

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8">
        <p className="mb-5 text-sm text-ink-soft">
          Say the phrase out loud, flip the card, then mark yourself right or wrong.
        </p>
        <button
          onClick={() => start(false)}
          className="mb-3 w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white"
        >
          15 minutes
        </button>
        <button
          onClick={() => start(true)}
          className="mb-3 w-full rounded-2xl border border-border px-4 py-3 text-center text-sm font-medium"
        >
          No time limit
        </button>
        <button onClick={onDone} className="w-full text-center text-sm text-ink-soft underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (phase === 'loading') {
    return <Spinner message="Finding your next card..." />;
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Couldn't load your cards.</p>
        <button onClick={finishAndExit} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">
          {reviewedCount === 0 ? 'No phrases due right now.' : `You reviewed ${reviewedCount} cards.`}
        </p>
        <button onClick={finishAndExit} className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (phase === 'time-up') {
    return (
      <div className="mx-auto max-w-sm px-5 py-8 text-center">
        <p className="mb-5 text-ink-soft">Time's up!</p>
        <button
          onClick={continueWithoutTimer}
          className="mb-3 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
        >
          Continue without the timer
        </button>
        <button onClick={finishAndExit} className="w-full text-sm text-ink-soft underline">
          Finish
        </button>
      </div>
    );
  }

  if (!phrase) {
    return null;
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={finishAndExit} className="text-sm text-ink-soft underline">
          End session
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-soft">{reviewedCount} reviewed</span>
          {session && !timerDisabled && <SessionTimer deadline={getSessionDeadline(session)} />}
        </div>
      </div>

      {phrase.expandedBeyondTopic && (
        <p className="mb-2 text-xs text-ink-soft">Ran out of phrases in your chosen topic — pulling from everything else.</p>
      )}

      <div className="mb-2 flex justify-end">
        <BoxDots box={phrase.box} />
      </div>
      <div className="mb-5 rounded-2xl border border-border bg-surface-soft px-5 py-6 text-center font-serif text-xl">
        {phrase.ruGloss}
      </div>

      {revealed ? (
        <>
          <div className="mb-5 rounded-2xl bg-accent-soft px-5 py-6 text-center font-serif text-xl text-accent">
            {phrase.enText}
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => grade('incorrect')}
              className="flex-1 rounded-2xl border border-bad/30 bg-bad/15 px-4 py-3.5 font-semibold text-bad"
            >
              ✗ I got it wrong
            </button>
            <button
              onClick={() => grade('correct')}
              className="flex-1 rounded-2xl border border-good/30 bg-good/15 px-4 py-3.5 font-semibold text-good"
            >
              ✓ I got it right
            </button>
          </div>
        </>
      ) : (
        <button onClick={reveal} className="w-full rounded-2xl bg-accent px-4 py-3.5 font-semibold text-white">
          Show translation
        </button>
      )}
    </div>
  );
}
