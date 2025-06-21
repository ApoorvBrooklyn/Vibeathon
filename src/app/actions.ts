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
  model: string
): Promise<GenerateRealtimeResultOutput> {
  const result = await generateRealtimeResult({prompt, model});
  return result;
}

export async function optimizePromptAction(
  prompt: string,
  model: string
): Promise<PromptOptimizerOutput> {
  const result = await promptOptimizer({prompt, model});
  return result;
}
