import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';
import { CEFR_TOPICS } from '../grammar/cefr-topics.js';

const DISCUSS_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_turn',
    description: 'Submit feedback on the learner turn and the tutor reply that continues the discussion',
    parameters: {
      type: 'object',
      properties: {
        feedback: {
          type: 'string',
          description: 'One short, encouraging sentence in English on grammar/fluency for this turn. Empty string if nothing worth noting.',
        },
        corrections: {
          type: 'array',
          description: 'At most 2 concrete mistakes worth flagging this turn.',
          items: {
            type: 'object',
            properties: {
              mistake: { type: 'string' },
              fix: { type: 'string' },
              topic: {
                type: 'string',
                description: 'If this mistake matches one of the given grammar topics, its exact name. Empty string otherwise.',
              },
            },
            required: ['mistake', 'fix', 'topic'],
          },
        },
        reply: {
          type: 'string',
          description:
            'What you say back, in character as a curious colleague discussing the article — either one short natural follow-up question (comprehension or opinion), or a warm closing remark if wrapping up.',
        },
        done: {
          type: 'boolean',
          description: 'True if the discussion should end after this reply.',
        },
        suggestedPhrases: {
          type: 'array',
          description:
            '0-2 phrases genuinely worth memorizing from the article or this exchange. Leave empty if nothing stands out — do not force it.',
          items: {
            type: 'object',
            properties: {
              enText: { type: 'string' },
              ruGloss: {
                type: 'string',
                description: 'A natural, idiomatic Russian equivalent, not a literal translation.',
              },
              usageNote: { type: 'string', description: 'One short sentence in Russian on when to use it.' },
            },
            required: ['enText'],
          },
        },
      },
      required: ['feedback', 'corrections', 'reply', 'done', 'suggestedPhrases'],
    },
  },
};

export type ConversationTurn = { role: 'user' | 'assistant'; content: string };

export type LessonReadingTurnResult = {
  feedback: string;
  corrections: { mistake: string; fix: string; topic: string }[];
  reply: string;
  done: boolean;
  suggestedPhrases: { enText: string; ruGloss?: string; usageNote?: string }[];
};

const MAX_ASSISTANT_TURNS = 4;

export async function discussLessonReading(
  articleText: string,
  history: ConversationTurn[],
  userUtterance: string,
): Promise<LessonReadingTurnResult> {
  const assistantTurnsSoFar = history.filter((turn) => turn.role === 'assistant').length;
  const isFinalTurn = assistantTurnsSoFar + 1 >= MAX_ASSISTANT_TURNS;

  const messages = [
    {
      role: 'system' as const,
      content: [
        'You are a curious colleague discussing an article with a Russian-speaking B1-C1 software engineer who just read it.',
        `The article they read: "${articleText}"`,
        'Continue the discussion naturally based on what they just said, mixing comprehension checks and opinion questions.',
        'Focus feedback on grammar and natural fluency, not on summarizing the article back to them.',
        `For each correction, check if it matches one of these grammar topics and tag it by its exact name: ${CEFR_TOPICS.map((t) => t.name).join(', ')}.`,
        isFinalTurn
          ? 'This is the last turn: give feedback, then a warm one-sentence closing remark instead of a new question, and set done to true.'
          : 'Give brief feedback, then ask exactly one short natural follow-up question continuing the discussion, and set done to false.',
      ].join(' '),
    },
    ...history.map((turn) => ({ role: turn.role, content: turn.content })),
    { role: 'user' as const, content: userUtterance },
  ];

  return withObservability('discussLessonReading', async () => {
    const MAX_ATTEMPTS = 2;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages,
        tools: [DISCUSS_TOOL],
        tool_choice: { type: 'function', function: { name: 'submit_turn' } },
      });

      const toolCall = response.choices[0].message.tool_calls?.[0];

      if (toolCall && toolCall.type === 'function') {
        const result = JSON.parse(toolCall.function.arguments) as LessonReadingTurnResult;
        return { result: { ...result, done: isFinalTurn || result.done }, response };
      }

      if (attempt === MAX_ATTEMPTS) {
        throw new Error('Model did not return a tool call for submit_turn after retry');
      }
    }

    throw new Error('Model did not return a tool call for submit_turn after retry');
  });
}
