import { describe, it, expect, vi } from 'vitest';
import { client } from './agent-client.js';
import { analyzeFreeTalk } from './analyze-free-talk.js';

vi.mock('./agent-client.js', () => ({
  client: { chat: { completions: { create: vi.fn() } } },
  MODEL: 'deepseek/deepseek-chat',
}));

vi.mock('./record-agent-call.js', () => ({
  recordAgentCall: vi.fn(),
}));

describe('analyzeFreeTalk', () => {
  it('returns the parsed analysis from the tool call', async () => {
    const analysis = {
      grammar: '',
      naturalness: 'Sounds like a direct translation from Russian.',
      fluency: 'Good pace, no major hesitation markers.',
      suggestedPhrases: [{ enText: 'catch up with someone', ruGloss: 'наверстать общение с кем-то' }],
    };

    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { tool_calls: [{ type: 'function', function: { arguments: JSON.stringify(analysis) } }] } }],
    } as never);

    const result = await analyzeFreeTalk('catching up with an old friend', 'I want to renew contact with him');

    expect(result).toEqual(analysis);
  });

  it('throws when the model does not return a tool call', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { tool_calls: undefined } }],
    } as never);

    await expect(analyzeFreeTalk('topic', 'response')).rejects.toThrow();
  });
});
