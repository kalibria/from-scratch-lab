export function Spinner({ message }: { message?: string } = {}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent motion-reduce:animate-none" />
      {message && <p className="text-sm text-ink-soft">{message}</p>}
    </div>
  );
}
