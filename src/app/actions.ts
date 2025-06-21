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
  prompt: string
): Promise<GenerateRealtimeResultOutput> {
  const result = await generateRealtimeResult({ prompt });
  return result;
}

export async function optimizePromptAction(
  prompt: string
): Promise<PromptOptimizerOutput> {
  const result = await promptOptimizer({ prompt });
  return result;
}
