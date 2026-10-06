import { describe, it, expect, vi } from 'vitest';
import { client } from './agent-client.js';
import { evaluateWritingTask } from './evaluate-writing-task.js';

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

describe('evaluateWritingTask', () => {
  it('returns the parsed verdict from the tool call', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue(
      mockToolCallResponse({ verdict: 'correct', feedback: 'Well written', grammarTopic: '' }) as never,
    );

    const result = await evaluateWritingTask(
      'project kickoffs',
      'First Conditional',
      'Write about a project kickoff.',
      'If we start on time, we will finish early.',
    );

    expect(result).toEqual({ verdict: 'correct', feedback: 'Well written', grammarTopic: '' });
  });

  it('throws when the model does not return a tool call', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { tool_calls: undefined } }],
    } as never);

    await expect(
      evaluateWritingTask('project kickoffs', 'First Conditional', 'prompt', 'answer'),
    ).rejects.toThrow();
  });
});
