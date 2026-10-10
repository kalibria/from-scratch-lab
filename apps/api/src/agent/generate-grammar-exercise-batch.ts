import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const BATCH_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_exercises',
    description: 'Submit a batch of distinct grammar practice exercises for one topic',
    parameters: {
      type: 'object',
      properties: {
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['closed', 'open'] },
              prompt: {
                type: 'string',
                description:
                  'One self-contained exercise, plain text, no markdown. For "closed": a fill-in-the-blank sentence whose blank takes a single word or short fixed phrase. For "open": a sentence-rewrite, translation, or correct-the-sentence task with more than one valid phrasing.',
              },
              correctAnswer: {
                type: 'string',
                description:
                  'Required for "closed" exercises only: the exact word or short phrase that fills the blank, nothing else (no punctuation, no explanation). Omit entirely for "open" exercises.',
              },
            },
            required: ['type', 'prompt'],
          },
        },
      },
      required: ['exercises'],
    },
  },
};

export type GeneratedExercise = { type: 'closed' | 'open'; prompt: string; correctAnswer?: string };

export async function generateGrammarExerciseBatch(
  topicName: string,
  topicDescription: string,
  count: number,
): Promise<GeneratedExercise[]> {
  return withObservability('generateGrammarExerciseBatch', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You write grammar practice exercises for a Russian-speaking B2-C1 software engineer. Write exactly ${count} distinct exercises testing the given grammar topic, aimed solidly at B2+ difficulty — not beginner examples.

Rules:
- No two exercises may share the same main verb, subject, or scenario. Spread them across different contexts (work meetings, software projects, travel, daily life, news, relationships, etc.) — do not default to the same one or two example verbs repeatedly.
- About 2/3 of exercises should be "closed": a fill-in-the-blank sentence where the blank takes exactly one unambiguous word or short fixed phrase (2-4 words). Give that exact expected answer in correctAnswer.
- About 1/3 should be "open": a fuller task (rewrite the sentence, correct the mistake, translate a sentence) where more than one phrasing could be correct — do not give a correctAnswer for these, they'll be graded by a human-level judge.
- Keep each exercise self-contained (no shared context between items) and in plain text with no markdown.`,
        },
        { role: 'user', content: `Topic: ${topicName}. ${topicDescription}` },
      ],
      tools: [BATCH_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_exercises' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_exercises');
    }

    const { exercises } = JSON.parse(toolCall.function.arguments) as { exercises: GeneratedExercise[] };
    return { result: exercises, response };
  });
}
