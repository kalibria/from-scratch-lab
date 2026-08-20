import { describe, it, expect, vi } from 'vitest';
import { recordAgentCall } from './record-agent-call.js';
import { withObservability } from './with-observability.js';

vi.mock('./agent-client.js', () => ({
  client: { chat: { completions: { create: vi.fn() } } },
  MODEL: 'deepseek/deepseek-chat',
}));

vi.mock('./record-agent-call.js', () => ({
  recordAgentCall: vi.fn(),
}));

describe('withObservability', () => {
  it('records success and returns the result', async () => {
    const response = { usage: { prompt_tokens: 10, completion_tokens: 5 } } as never;

    const result = await withObservability('testFn', async () => ({ result: 'ok', response }));

    expect(result).toBe('ok');
    expect(recordAgentCall).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'testFn', status: 'success', promptTokens: 10, completionTokens: 5 }),
    );
  });

  it('records an error and rethrows', async () => {
    await expect(
      withObservability('testFn', async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(recordAgentCall).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'testFn', status: 'error', errorMessage: 'boom' }),
    );
  });
});
