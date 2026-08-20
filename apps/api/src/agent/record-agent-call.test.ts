import { describe, it, expect, vi } from 'vitest';
import { db } from '../db/client.js';
import { recordAgentCall } from './record-agent-call.js';

vi.mock('../db/client.js', () => ({
  db: { insert: vi.fn() },
}));

describe('recordAgentCall', () => {
  it('writes the record to the database', async () => {
    const values = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values } as never);

    await recordAgentCall({ functionName: 'test', model: 'x', latencyMs: 10, status: 'success' });

    expect(values).toHaveBeenCalledWith({ functionName: 'test', model: 'x', latencyMs: 10, status: 'success' });
  });

  it('does not throw when the database write fails', async () => {
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockRejectedValue(new Error('db down')),
    } as never);

    await expect(
      recordAgentCall({ functionName: 'test', model: 'x', latencyMs: 10, status: 'success' }),
    ).resolves.toBeUndefined();
  });
});
