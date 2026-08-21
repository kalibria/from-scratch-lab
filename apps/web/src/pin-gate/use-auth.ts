import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous' | 'error';

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>('checking');

  async function checkAuth() {
    setStatus('checking');

    try {
      const res = await apiFetch('/auth/me');
      setStatus(res.ok ? 'authenticated' : 'anonymous');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(pin: string): Promise<boolean> {
    try {
      const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ pin }) });
      const ok = res.ok;
      if (ok) setStatus('authenticated');
      return ok;
    } catch {
      setStatus('error');
      return false;
    }
  }

  return { status, login, retry: checkAuth };
}
