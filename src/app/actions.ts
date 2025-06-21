'use server';

import {
  generateRealtimeResult,
  GenerateRealtimeResultOutput,
} from '@/ai/flows/realtime-results';
import {
  promptOptimizer,
  PromptOptimizerOutput,
} from '@/ai/flows/prompt-optimizer';

export async function runPromptAction(
  prompt: string,
  model: string,
  evaluationCriteria: string
): Promise<GenerateRealtimeResultOutput> {
  const result = await generateRealtimeResult({prompt, model, evaluationCriteria});
  return result;
}

export async function optimizePromptAction(
  prompt: string,
  model: string
): Promise<PromptOptimizerOutput> {
  const result = await promptOptimizer({prompt, model});
  return result;
}
