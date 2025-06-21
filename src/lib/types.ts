import type { GenerateRealtimeResultOutput } from '@/ai/flows/realtime-results';

export interface Prompt {
  id: number;
  prompt: string;
  result: GenerateRealtimeResultOutput | null;
}
