import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const EXTRACT_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_phrases',
    description: 'Submit the list of English phrases extracted from the text',
    parameters: {
      type: 'object',
      properties: {
        phrases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              enText: { type: 'string' },
              ruGloss: { type: 'string' },
            },
            required: ['enText'],
          },
        },
      },
      required: ['phrases'],
    },
  },
};

export type ExtractedPhrase = { enText: string; ruGloss?: string };

export async function extractPhrases(text: string): Promise<ExtractedPhrase[]> {
  return withObservability('extractPhrases', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You help a Russian-speaking B1-B2 English learner build a vocabulary deck. Extract distinct useful English phrases/collocations from the given text. If the text is already a list of phrases, just clean it up. Provide a short Russian gloss for each.',
        },
        { role: 'user', content: text },
      ],
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_phrases' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_phrases');
    }

    const { phrases } = JSON.parse(toolCall.function.arguments) as { phrases: ExtractedPhrase[] };
    return { result: phrases, response };
  });
}
