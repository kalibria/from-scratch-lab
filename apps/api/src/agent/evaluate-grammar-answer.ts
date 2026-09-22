import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

const VERDICT_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_verdict',
    description: 'Submit the evaluation of the learner answer to a grammar exercise',
    parameters: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['correct', 'incorrect', 'close'] },
        feedback: {
          type: 'string',
          description: 'Brief feedback in English, plain text only. Explain why, and show the correct form if wrong.',
        },
      },
      required: ['verdict', 'feedback'],
    },
  },
};

export type GrammarVerdict = { verdict: 'correct' | 'incorrect' | 'close'; feedback: string };

export async function evaluateGrammarAnswer(
  topicName: string,
  exercisePrompt: string,
  userAnswer: string,
): Promise<GrammarVerdict> {
  return withObservability('evaluateGrammarAnswer', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a native English-speaking tutor for a Russian-speaking B1-B2/C1 learner. Judge whether the learner correctly applied the grammar topic "${topicName}" in their answer to the exercise.`,
        },
        { role: 'user', content: `Exercise: "${exercisePrompt}". Learner's answer: "${userAnswer}".` },
      ],
      tools: [VERDICT_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_verdict' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_verdict');
    }

    return { result: JSON.parse(toolCall.function.arguments) as GrammarVerdict, response };
  });
}
