import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';
import { CEFR_TOPICS } from '../grammar/cefr-topics.js';

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
        grammarTopic: {
          type: 'string',
          description:
            'If the mistake matches one of the given grammar topics, its exact name. Empty string if verdict is "correct" or the mistake is not a grammar issue (e.g. wrong vocabulary choice).',
        },
      },
      required: ['verdict', 'feedback', 'nativePhrase', 'grammarTopic'],
    },
  },
};

export type DrillVerdict = {
  verdict: 'correct' | 'incorrect' | 'close';
  feedback: string;
  nativePhrase: string;
  grammarTopic: string;
};

export async function evaluateDrillAnswer(targetPhrase: string, userAnswer: string): Promise<DrillVerdict> {
  return withObservability('evaluateDrillAnswer', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a native English-speaking tutor for a Russian-speaking B1-B2 learner. Judge whether the translation is grammatically correct AND whether it sounds natural — the way a native speaker would actually say it — rather than a literal translation from Russian. If there's a grammar mistake, check if it matches one of these topics and tag it by its exact name: ${CEFR_TOPICS.map((t) => t.name).join(', ')}.`,
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
