import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const ANALYSIS_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_analysis',
    description: 'Submit the three-axis analysis of the learner response',
    parameters: {
      type: 'object',
      properties: {
        grammar: {
          type: 'string',
          description: 'Grammar issues found, in English, plain text (no markdown). Empty string if none.',
        },
        naturalness: {
          type: 'string',
          description:
            'Whether the phrasing sounds native or is a literal Russian calque, in English, plain text (no markdown).',
        },
        fluency: {
          type: 'string',
          description: 'Notes on fluency/wordiness/hedging, in English, plain text (no markdown).',
        },
        suggestedPhrases: {
          type: 'array',
          description: 'Native-sounding phrases worth adding to the learner spaced-repetition deck.',
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
      required: ['grammar', 'naturalness', 'fluency', 'suggestedPhrases'],
    },
  },
};

export type FreeTalkAnalysis = {
  grammar: string;
  naturalness: string;
  fluency: string;
  suggestedPhrases: { enText: string; ruGloss?: string }[];
};

export async function analyzeFreeTalk(promptTopic: string, userResponse: string): Promise<FreeTalkAnalysis> {
  return withObservability('analyzeFreeTalk', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a native English-speaking tutor for a Russian-speaking B1-B2 learner. Analyze their free-talk response on three axes: grammar correctness, naturalness (native-like phrasing vs. literal Russian calque), and fluency. Suggest native-sounding phrases worth memorizing.',
        },
        { role: 'user', content: `Topic: "${promptTopic}". Learner's response: "${userResponse}".` },
      ],
      tools: [ANALYSIS_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_analysis' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_analysis');
    }

    return { result: JSON.parse(toolCall.function.arguments) as FreeTalkAnalysis, response };
  });
}
