import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const GENERATE_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_recitation_text',
    description: 'Submit the generated monologue for the learner to memorize and recite',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: '80-120 word first-person monologue in natural spoken English.',
        },
        phrasesUsed: {
          type: 'array',
          items: { type: 'string' },
          description: 'Which of the supplied phrases actually made it into the text.',
        },
      },
      required: ['text', 'phrasesUsed'],
    },
  },
};

export type GeneratedRecitationText = { text: string; phrasesUsed: string[] };

export async function generateRecitationText(topic: string, phrases: string[]): Promise<GeneratedRecitationText> {
  return withObservability('generateRecitationText', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You write short first-person monologues for a Russian-speaking B1-B2 software engineer to memorize and recite out loud, practicing workplace spoken English (standup updates, small talk, status reports, talking to colleagues). Write 80-120 words of natural, conversational spoken English — contractions, not formal writing. Naturally weave in as many of the given phrases as fit without forcing them; skip any that would sound unnatural.',
        },
        {
          role: 'user',
          content: `Topic: ${topic}\n\nPhrases to try to include:\n${phrases.map((p) => `- ${p}`).join('\n')}`,
        },
      ],
      tools: [GENERATE_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_recitation_text' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_recitation_text');
    }

    const result = JSON.parse(toolCall.function.arguments) as GeneratedRecitationText;
    return { result, response };
  });
}
