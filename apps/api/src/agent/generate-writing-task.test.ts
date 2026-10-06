import { describe, it, expect, vi } from 'vitest';
import { client } from './agent-client.js';
import { generateWritingTask } from './generate-writing-task.js';

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

describe('generateWritingTask', () => {
  it('returns the parsed prompt from the tool call', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue(
      mockToolCallResponse({ prompt: 'Write a short email about a project kickoff.' }) as never,
    );

    const result = await generateWritingTask('project kickoffs', 'First Conditional', 'if + present simple...');

    expect(result).toBe('Write a short email about a project kickoff.');
  });

  it('throws when the model does not return a tool call', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { tool_calls: undefined } }],
    } as never);

    await expect(generateWritingTask('project kickoffs', 'First Conditional', 'desc')).rejects.toThrow();
  });
});
