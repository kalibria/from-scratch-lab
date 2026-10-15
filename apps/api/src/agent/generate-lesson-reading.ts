import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const GENERATE_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_reading_text',
    description: 'Submit the generated reading passage and an opening discussion question about it',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description:
            '220-350 word article-style passage in natural written English, third person, informative but engaging (like a short blog post or trade-magazine piece) — not a dialogue, not a list.',
        },
        phrasesUsed: {
          type: 'array',
          items: { type: 'string' },
          description: 'Which of the supplied phrases actually made it into the text.',
        },
        openingQuestion: {
          type: 'string',
          description: 'One short, natural comprehension or opinion question about the article, to kick off a discussion once the learner has read it.',
        },
      },
      required: ['text', 'phrasesUsed', 'openingQuestion'],
    },
  },
};

export type GeneratedLessonReading = { text: string; phrasesUsed: string[]; openingQuestion: string };

export async function generateLessonReading(
  vocabTheme: string,
  level: string,
  phrases: string[],
): Promise<GeneratedLessonReading> {
  return withObservability('generateLessonReading', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You write reading passages for a Russian-speaking ${level} software engineer learning business/IT English. Write a 220-350 word article-style passage on the given theme, pitched at ${level} level — vocabulary and sentence complexity should match that CEFR level exactly, not simpler, not harder. Naturally weave in as many of the given phrases as fit without forcing them; skip any that would sound unnatural. Also write one short opening question to start a discussion about the article once the learner has read it.`,
        },
        {
          role: 'user',
          content: `Theme: ${vocabTheme}\n\nPhrases to try to include:\n${phrases.map((p) => `- ${p}`).join('\n')}`,
        },
      ],
      tools: [GENERATE_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_reading_text' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_reading_text');
    }

    const result = JSON.parse(toolCall.function.arguments) as GeneratedLessonReading;
    return { result, response };
  });
}
