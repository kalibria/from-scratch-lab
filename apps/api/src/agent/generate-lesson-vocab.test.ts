import { describe, it, expect, vi } from 'vitest';
import { client } from './agent-client.js';
import { generateLessonVocab } from './generate-lesson-vocab.js';

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

describe('generateLessonVocab', () => {
  it('returns the parsed phrase list from the tool call', async () => {
    const phrases = [{ enText: 'kick off a project', ruGloss: 'запустить проект', usageNote: 'Начало работы над проектом.' }];
    vi.mocked(client.chat.completions.create).mockResolvedValue(mockToolCallResponse({ phrases }) as never);

    const result = await generateLessonVocab('project kickoffs', 'B1');

    expect(result).toEqual(phrases);
  });

  it('throws when the model does not return a tool call', async () => {
    vi.mocked(client.chat.completions.create).mockResolvedValue({
      choices: [{ message: { tool_calls: undefined } }],
    } as never);

    await expect(generateLessonVocab('project kickoffs', 'B1')).rejects.toThrow();
  });
});
