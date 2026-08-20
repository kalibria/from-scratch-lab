import { client, MODEL } from './agent-client.js';
import { withObservability } from './with-observability.js';

export async function generateFreeTalkPrompt(): Promise<string> {
  return withObservability('generateFreeTalkPrompt', async () => {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a native English-speaking tutor for a Russian-speaking B1-B2 learner. Give one short, everyday speaking topic prompt (one or two sentences, in English) for a 60-90 second monologue. Vary the topic each time. Respond with plain text only — no markdown formatting, no asterisks, no headings.',
        },
        { role: 'user', content: 'Give me a speaking prompt.' },
      ],
    });

    const text = response.choices[0].message.content;

    if (!text) {
      throw new Error('Model did not return a prompt');
    }

    return { result: text.trim(), response };
  });
}
