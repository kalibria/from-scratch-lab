import { describe, it, expect, vi } from 'vitest';
import { client } from './agent-client.js';
import { evaluateDrillAnswer } from './evaluate-drill-answer.js';

vi.mock('./agent-client.js', () => ({
  client: { chat: { completions: { create: vi.fn() } } },
  MODEL: 'deepseek/deepseek-chat',
}));

vi.mock('./record-agent-call.js', () => ({
  recordAgentCall: vi.fn(),
}));

function mockToolCallResponse(args: Record<string, unknown>) {
  return {
    choices: [
      {
        message: {
          tool_calls: [{ type: 'function', function: { arguments: JSON.stringify(args) } }],
        },
      },
    ],
  };
}

describe('evaluateDrillAnswer', () => {
  it('returns the parsed verdict from the tool call', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue(
      mockToolCallResponse({ verdict: 'correct', feedback: 'Well done', nativePhrase: '' }) as never,
    );

    const result = await evaluateDrillAnswer('break the ice', 'to break the ice');

    expect(result).toEqual({ verdict: 'correct', feedback: 'Well done', nativePhrase: '' });
  });

  it('throws when the model does not return a tool call', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { tool_calls: undefined } }],
    } as never);

    await expect(evaluateDrillAnswer('break the ice', 'растопить лёд')).rejects.toThrow();
  });
});
