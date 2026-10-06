type SpinnerProps = { message?: string; onExit?: () => void };

export function Spinner({ message, onExit }: SpinnerProps = {}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent motion-reduce:animate-none" />
      {message && <p className="text-sm text-ink-soft">{message}</p>}
      {onExit && (
        <button onClick={onExit} className="mt-2 text-sm text-ink-soft underline">
          Back to dashboard
        </button>
      )}
    </div>
  );
}
