import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const TASK_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_task',
    description: 'Submit one open-ended writing task for this lesson',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description:
            'A short open-ended writing brief (2-3 sentences expected in response), combining the lesson vocabulary theme and grammar topic naturally. Plain text, no markdown.',
        },
      },
      required: ['prompt'],
    },
  },
};

export async function generateWritingTask(
  vocabTheme: string,
  grammarTopicName: string,
  grammarTopicDescription: string,
): Promise<string> {
  return withObservability('generateWritingTask', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            "You write short open-ended workplace writing tasks for a Russian-speaking B1-C1 software engineer. Write ONE task (e.g. 'write a short message/email about...') that naturally invites using the lesson's vocabulary theme and, where natural, its grammar topic. The learner may answer in 2-3 sentences, typed or spoken aloud.",
        },
        {
          role: 'user',
          content: `Vocabulary theme: ${vocabTheme}. Grammar topic: ${grammarTopicName} (${grammarTopicDescription}).`,
        },
      ],
      tools: [TASK_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_task' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_task');
    }

    const { prompt } = JSON.parse(toolCall.function.arguments) as { prompt: string };
    return { result: prompt, response };
  });
}
