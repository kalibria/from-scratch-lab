import { describe, it, expect, vi } from 'vitest';
import { client } from './agent-client.js';
import { generateFreeTalkPrompt } from './generate-free-talk-prompt.js';

vi.mock('./agent-client.js', () => ({
  client: { chat: { completions: { create: vi.fn() } } },
  MODEL: 'deepseek/deepseek-chat',
}));

vi.mock('./record-agent-call.js', () => ({
  recordAgentCall: vi.fn(),
}));

describe('generateFreeTalkPrompt', () => {
  it('returns the trimmed prompt text', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { content: '  Tell me about your weekend.  ' } }],
    } as never);

    const result = await generateFreeTalkPrompt();

    expect(result).toBe('Tell me about your weekend.');
  });

  it('throws when the model returns no content', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { content: null } }],
    } as never);

    await expect(generateFreeTalkPrompt()).rejects.toThrow();
  });
});
