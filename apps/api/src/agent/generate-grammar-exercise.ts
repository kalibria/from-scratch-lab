import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const EXERCISE_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_exercise',
    description: 'Submit one grammar practice exercise',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description:
            'One self-contained exercise for a Russian-speaking B1-B2 learner, e.g. a fill-in-the-blank sentence, a sentence to correct, or a short translation prompt. Plain text, no markdown.',
        },
      },
      required: ['prompt'],
    },
  },
};

export async function generateGrammarExercise(topicName: string, topicDescription: string): Promise<string> {
  return withObservability('generateGrammarExercise', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You write short grammar practice exercises for a Russian-speaking B1-B2/C1 software engineer. Write exactly one exercise testing the given grammar topic — vary the format (fill-in-the-blank, correct the sentence, translate a short phrase) each time.',
        },
        { role: 'user', content: `Topic: ${topicName}. ${topicDescription}` },
      ],
      tools: [EXERCISE_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_exercise' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_exercise');
    }

    const { prompt } = JSON.parse(toolCall.function.arguments) as { prompt: string };
    return { result: prompt, response };
  });
}
