import type { GenerateRealtimeResultOutput } from '@/ai/flows/realtime-results';

export interface Prompt {
  id: number;
  prompt: string;
  evaluationCriteria: string;
  result: GenerateRealtimeResultOutput | null;
  model: string;
}
