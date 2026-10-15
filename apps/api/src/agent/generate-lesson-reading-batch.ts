import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const BATCH_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_reading_batch',
    description: 'Submit a batch of distinct reading passages for this lesson, each inspired by the given source',
    parameters: {
      type: 'object',
      properties: {
        passages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description:
                  '220-350 word article-style passage in natural written English, third person — not a dialogue, not a list.',
              },
              openingQuestion: {
                type: 'string',
                description: 'One short, natural comprehension or opinion question about this specific passage.',
              },
            },
            required: ['text', 'openingQuestion'],
          },
        },
      },
      required: ['passages'],
    },
  },
};

export type GeneratedReadingPassage = { text: string; openingQuestion: string };

export async function generateLessonReadingBatch(
  vocabTheme: string,
  level: string,
  phrases: string[],
  sourceTitle: string,
  sourceSummary: string,
  count: number,
): Promise<GeneratedReadingPassage[]> {
  return withObservability('generateLessonReadingBatch', async () => {
    const messages = [
      {
        role: 'system' as const,
        content: `You write reading passages for a Russian-speaking ${level} software engineer learning business/IT English, on the theme "${vocabTheme}".

You are given a factual summary of a real, current article titled "${sourceTitle}" — already paraphrased into plain facts for you, not the original wording. Write ${count} DISTINCT 220-350 word article-style passages, each grounded in those facts but focusing on a different angle, detail, or implication of them (one might focus on the background, another on the practical impact, another on a specific example, etc.) — vary the angle enough that the ${count} passages don't feel repetitive. Do not invent facts that contradict the summary, but you may add plausible illustrative detail in the spirit of a magazine article.

Pitch vocabulary and sentence complexity exactly at ${level} level. Naturally weave in as many of the given lesson phrases as fit without forcing them. Each passage also gets its own short opening question (comprehension or opinion) to kick off a discussion about it.`,
      },
      {
        role: 'user' as const,
        content: `Source facts:\n${sourceSummary}\n\nLesson phrases to try to include:\n${phrases.map((p) => `- ${p}`).join('\n')}`,
      },
    ];

    const MAX_ATTEMPTS = 4;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: MODEL,
          messages,
          tools: [BATCH_TOOL],
          tool_choice: { type: 'function', function: { name: 'submit_reading_batch' } },
        });

        const toolCall = response.choices?.[0]?.message.tool_calls?.[0];

        if (toolCall && toolCall.type === 'function') {
          const { passages } = JSON.parse(toolCall.function.arguments) as { passages: GeneratedReadingPassage[] };
          return { result: passages, response };
        }
      } catch (error) {
        if (attempt === MAX_ATTEMPTS) {
          throw error;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
    }

    throw new Error('Model did not return a usable tool call for submit_reading_batch after retries');
  });
}
