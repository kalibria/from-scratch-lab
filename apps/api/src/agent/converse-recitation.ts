import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';
import { CEFR_TOPICS } from '../grammar/cefr-topics.js';

const CONVERSE_TOOL = {
  type: 'function' as const,
  function: {
    name: 'submit_turn',
    description: 'Submit feedback on the learner turn and the tutor reply that continues the conversation',
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
            'What you say back, in character as a friendly colleague — either one short natural follow-up question, or a warm closing remark if wrapping up.',
        },
        done: {
          type: 'boolean',
          description: 'True if the conversation should end after this reply.',
        },
      },
      required: ['feedback', 'corrections', 'reply', 'done'],
    },
  },
};

export type ConversationTurn = { role: 'user' | 'assistant'; content: string };

export type RecitationTurnResult = {
  feedback: string;
  corrections: { mistake: string; fix: string; topic: string }[];
  reply: string;
  done: boolean;
};

export async function converseRecitation(
  originalText: string,
  history: ConversationTurn[],
  userUtterance: string,
  isFinalTurn: boolean,
): Promise<RecitationTurnResult> {
  const messages = [
    {
      role: 'system' as const,
      content: [
        'You are a friendly colleague helping a Russian-speaking B1-B2 software engineer practice spoken English.',
        `They were asked to memorize and recite this text: "${originalText}"`,
        'Loosely compare what they say to the original text — paraphrasing is fine, this is not a memory test. Focus on grammar and natural spoken fluency.',
        'Your goal for this whole conversation: keep it short and natural, like real small talk following up on what they said — not an interview, not a lecture.',
        `For each correction, check if it matches one of these grammar topics and tag it by its exact name: ${CEFR_TOPICS.map((t) => t.name).join(', ')}.`,
        isFinalTurn
          ? 'This is the last turn: give feedback, then a warm one-sentence closing remark instead of a new question, and set done to true.'
          : 'Give brief feedback, then ask exactly one short natural follow-up question continuing the conversation, and set done to false — unless the conversation already feels naturally finished, in which case close it and set done to true.',
      ].join(' '),
    },
    ...history.map((turn) => ({ role: turn.role, content: turn.content })),
    { role: 'user' as const, content: userUtterance },
  ];

  return withObservability('converseRecitation', async () => {
    const MAX_ATTEMPTS = 2;
    let lastResponse;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      lastResponse = await client.chat.completions.create({
        model: MODEL,
        messages,
        tools: [CONVERSE_TOOL],
        tool_choice: { type: 'function', function: { name: 'submit_turn' } },
      });

      const toolCall = lastResponse.choices[0].message.tool_calls?.[0];

      if (toolCall && toolCall.type === 'function') {
        const result = JSON.parse(toolCall.function.arguments) as RecitationTurnResult;
        return { result: { ...result, done: isFinalTurn || result.done }, response: lastResponse };
      }
    }

    throw new Error('Model did not return a tool call for submit_turn after retry');
  });
}
