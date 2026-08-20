import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useAuth } from './use-auth.js';
import { Spinner } from '../components/Spinner.js';

export function PinGate({ children }: { children: ReactNode }) {
  const { status, login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (status === 'checking') {
    return <Spinner />;
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const ok = await login(pin);
    setError(!ok);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="password"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          placeholder="PIN"
          autoFocus
          className="mb-4 w-full rounded-2xl border border-border px-4 py-3 text-center"
        />
        <button type="submit" className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white">
          Log in
        </button>
        {error && <p className="mt-3 text-center text-sm text-bad">Incorrect PIN</p>}
      </form>
    </div>
  );
}
