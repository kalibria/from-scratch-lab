import { useEffect, useState } from 'react';
import { apiFetch } from '../api-client.js';

export type AgentStats = {
  totalCalls: number;
  totalTokens: number;
  errorCount: number;
  byFunction: { functionName: string; calls: number; tokens: number; avgLatencyMs: number; errors: number }[];
};

export function useAgentStats() {
  const [stats, setStats] = useState<AgentStats | null>(null);

  useEffect(() => {
    apiFetch('/stats/agent')
      .then((res) => res.json())
      .then(setStats);
  }, []);

  return stats;
}
