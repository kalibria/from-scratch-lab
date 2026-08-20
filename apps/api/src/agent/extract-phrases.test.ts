import { describe, it, expect, vi } from 'vitest';
import { client } from './agent-client.js';
import { extractPhrases } from './extract-phrases.js';

vi.mock('./agent-client.js', () => ({
  client: { chat: { completions: { create: vi.fn() } } },
  MODEL: 'deepseek/deepseek-chat',
}));

vi.mock('./record-agent-call.js', () => ({
  recordAgentCall: vi.fn(),
}));

describe('extractPhrases', () => {
  it('returns the parsed phrase list from the tool call', async () => {
    const phrases = [{ enText: 'break the ice', ruGloss: 'растопить лёд' }];

    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { tool_calls: [{ type: 'function', function: { arguments: JSON.stringify({ phrases }) } }] } }],
    } as never);

    const result = await extractPhrases('break the ice, catch up with someone');

    expect(result).toEqual(phrases);
  });

  it('throws when the model does not return a tool call', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { tool_calls: undefined } }],
    } as never);

    await expect(extractPhrases('some text')).rejects.toThrow();
  });
});
