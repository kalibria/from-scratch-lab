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
              ruGloss: {
                type: 'string',
                description:
                  'A natural, idiomatic Russian equivalent — how a Russian speaker would actually phrase the same idea, not a literal word-for-word translation.',
              },
              usageNote: {
                type: 'string',
                description:
                  'One short sentence in Russian explaining when/in what situation this phrase is used, so the learner understands the context, not just the translation.',
              },
            },
            required: ['enText'],
          },
        },
      },
      required: ['phrases'],
    },
  },
};

export type ExtractedPhrase = { enText: string; ruGloss?: string; usageNote?: string };

export async function extractPhrases(text: string): Promise<ExtractedPhrase[]> {
  return withObservability('extractPhrases', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You help a Russian-speaking B1-B2 English learner build a vocabulary deck. Extract distinct useful English phrases/collocations from the given text. If the text is already a list of phrases, just clean it up. For each, give a natural idiomatic Russian equivalent (not a literal translation) plus a short usage note explaining the context.',
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
