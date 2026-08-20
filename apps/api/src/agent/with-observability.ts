import type OpenAI from 'openai';
import { client, MODEL } from './agent-client.js';
import { recordAgentCall } from './record-agent-call.js';

type ChatCompletion = OpenAI.Chat.Completions.ChatCompletion;

export async function withObservability<T>(
  functionName: string,
  run: () => Promise<{ result: T; response: ChatCompletion }>,
): Promise<T> {
  const start = Date.now();

  try {
    const { result, response } = await run();

    await recordAgentCall({
      functionName,
      model: MODEL,
      latencyMs: Date.now() - start,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      status: 'success',
    });

    return result;
  } catch (err) {
    await recordAgentCall({
      functionName,
      model: MODEL,
      latencyMs: Date.now() - start,
      status: 'error',
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
