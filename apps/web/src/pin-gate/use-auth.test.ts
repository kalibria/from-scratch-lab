import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from './use-auth.js';

describe('useAuth', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('sets status to authenticated when /auth/me succeeds', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useAuth());

    expect(result.current.status).toBe('checking');
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
  });

  it('sets status to anonymous when /auth/me fails', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.status).toBe('anonymous'));
  });

  it('login sets status to authenticated on success', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.status).toBe('anonymous'));

    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    let loginResult: boolean | undefined;
    await act(async () => {
      loginResult = await result.current.login('1234');
    });

    expect(loginResult).toBe(true);
    expect(result.current.status).toBe('authenticated');
  });
});
