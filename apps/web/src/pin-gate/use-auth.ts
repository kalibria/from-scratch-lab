import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    apiFetch('/auth/me').then((res) => setStatus(res.ok ? 'authenticated' : 'anonymous'));
  }, []);

  async function login(pin: string): Promise<boolean> {
    const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ pin }) });
    const ok = res.ok;
    if (ok) setStatus('authenticated');
    return ok;
  }

  return { status, login };
}
