import type { GenerateRealtimeResultOutput } from '@/ai/flows/realtime-results';

export interface Prompt {
  id: number;
  prompt: string;
  evaluationCriteria: string;
  result: GenerateRealtimeResultOutput | null;
  model: string;
}

export interface SavedPrompt {
  id: number;
  prompt: string;
  evaluationCriteria: string;
  model: string;
}
