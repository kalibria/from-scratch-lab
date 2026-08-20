const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
}
