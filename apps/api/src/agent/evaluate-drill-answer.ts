import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const VERDICT_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_verdict',
    description: 'Submit the evaluation of the learner answer',
    parameters: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['correct', 'incorrect', 'close'] },
        feedback: {
          type: 'string',
          description:
            'Brief feedback in English, plain text only (no markdown, no asterisks). Explain why, in one short sentence.',
        },
        nativePhrase: {
          type: 'string',
          description:
            'The exact phrase a native speaker would say, containing only the phrase itself with no explanation (e.g. "break the ice"). Only set this when verdict is "close" or "incorrect" — the phrase the learner should memorize. Empty string when verdict is "correct".',
        },
      },
      required: ['verdict', 'feedback', 'nativePhrase'],
    },
  },
};

export type DrillVerdict = {
  verdict: 'correct' | 'incorrect' | 'close';
  feedback: string;
  nativePhrase: string;
};

export async function evaluateDrillAnswer(targetPhrase: string, userAnswer: string): Promise<DrillVerdict> {
  return withObservability('evaluateDrillAnswer', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a native English-speaking tutor for a Russian-speaking B1-B2 learner. Judge whether the translation is grammatically correct AND whether it sounds natural — the way a native speaker would actually say it — rather than a literal translation from Russian.',
        },
        { role: 'user', content: `Target phrase: "${targetPhrase}". Learner's answer: "${userAnswer}".` },
      ],
      tools: [VERDICT_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_verdict' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_verdict');
    }

    return { result: JSON.parse(toolCall.function.arguments) as DrillVerdict, response };
  });
}
