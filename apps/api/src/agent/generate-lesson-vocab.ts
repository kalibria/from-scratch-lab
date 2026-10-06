import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const VOCAB_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_vocab',
    description: 'Submit a list of phrases to memorize for this lesson theme',
    parameters: {
      type: 'object',
      properties: {
        phrases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              enText: { type: 'string' },
              ruGloss: {
                type: 'string',
                description:
                  'A natural, idiomatic Russian equivalent — how a Russian speaker would actually phrase the same idea, not a literal word-for-word translation.',
              },
              usageNote: {
                type: 'string',
                description: 'One short sentence in Russian explaining when/in what situation this phrase is used.',
              },
            },
            required: ['enText', 'ruGloss', 'usageNote'],
          },
        },
      },
      required: ['phrases'],
    },
  },
};

export type LessonVocabPhrase = { enText: string; ruGloss: string; usageNote: string };

export async function generateLessonVocab(vocabTheme: string, level: string): Promise<LessonVocabPhrase[]> {
  return withObservability('generateLessonVocab', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You build vocabulary decks for a Russian-speaking software engineer learning business and IT English. Give exactly 10 distinct, useful English phrases/collocations for the given lesson theme, at the given CEFR level. For each, give a natural idiomatic Russian equivalent and a short usage note.',
        },
        { role: 'user', content: `Lesson theme: ${vocabTheme}. Level: ${level}.` },
      ],
      tools: [VOCAB_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_vocab' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_vocab');
    }

    const { phrases } = JSON.parse(toolCall.function.arguments) as { phrases: LessonVocabPhrase[] };
    return { result: phrases, response };
  });
}
