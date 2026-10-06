import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';
import { CEFR_TOPICS } from '../grammar/cefr-topics.js';

const VERDICT_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_verdict',
    description: 'Submit the evaluation of the learner answer to a writing task',
    parameters: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['correct', 'incorrect', 'close'] },
        feedback: {
          type: 'string',
          description: 'Brief feedback in English, plain text only. Explain why, and show a better phrasing if useful.',
        },
        grammarTopic: {
          type: 'string',
          description:
            'If there is a grammar mistake that matches one of the given topics, its exact name. Empty string otherwise.',
        },
      },
      required: ['verdict', 'feedback', 'grammarTopic'],
    },
  },
};

export type WritingVerdict = { verdict: 'correct' | 'incorrect' | 'close'; feedback: string; grammarTopic: string };

export async function evaluateWritingTask(
  vocabTheme: string,
  grammarTopicName: string,
  prompt: string,
  userAnswer: string,
): Promise<WritingVerdict> {
  return withObservability('evaluateWritingTask', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a native English-speaking tutor for a Russian-speaking B1-C1 learner. Judge whether the learner's response reasonably completes the writing task, is grammatically sound, and ideally uses vocabulary related to "${vocabTheme}". Pay particular attention to correct use of "${grammarTopicName}", but note any grammar mistake, not only that topic. Be lenient about length — 1-3 sentences is enough. If there's a grammar mistake, check if it matches one of these topics and tag it by its exact name: ${CEFR_TOPICS.map((t) => t.name).join(', ')}.`,
        },
        { role: 'user', content: `Task: "${prompt}". Learner's response: "${userAnswer}".` },
      ],
      tools: [VERDICT_TOOL],
      tool_choice: { type: 'function', function: { name: 'submit_verdict' } },
    });

    const toolCall = response.choices[0].message.tool_calls?.[0];

    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('Model did not return a tool call for submit_verdict');
    }

    return { result: JSON.parse(toolCall.function.arguments) as WritingVerdict, response };
  });
}
