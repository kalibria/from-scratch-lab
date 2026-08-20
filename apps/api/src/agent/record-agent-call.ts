import { db } from '../db/client.js';
import { agentCalls } from '../db/schema.js';

type AgentCallRecord = {
  functionName: string;
  model: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  status: 'success' | 'error';
  errorMessage?: string;
};

export async function recordAgentCall(record: AgentCallRecord) {
  try {
    await db.insert(agentCalls).values(record);
  } catch (err) {
    console.error('Failed to record agent call (non-fatal):', err);
  }
}
