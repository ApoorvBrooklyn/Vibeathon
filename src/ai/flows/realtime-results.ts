'use server';

/**
 * @fileOverview A Genkit flow that sends prompt variations to the LLM and displays the results in real-time.
 *
 * - generateRealtimeResult - A function that sends a prompt to the LLM and returns the result.
 * - GenerateRealtimeResultInput - The input type for the generateRealtimeResult function.
 * - GenerateRealtimeResultOutput - The return type for the generateRealtimeResult function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRealtimeResultInputSchema = z.object({
  prompt: z.string().describe('The prompt variation to send to the LLM.'),
});
export type GenerateRealtimeResultInput = z.infer<typeof GenerateRealtimeResultInputSchema>;

const GenerateRealtimeResultOutputSchema = z.object({
  result: z.string().describe('The result from the LLM.'),
  quality: z.string().describe('An emoji representing the quality of the result.'),
  length: z.number().describe('The length of the result in characters.'),
  latency: z.number().describe('The latency of the LLM response in milliseconds.'),
  tokenUsage: z.number().describe('The number of tokens used by the LLM.'),
});
export type GenerateRealtimeResultOutput = z.infer<typeof GenerateRealtimeResultOutputSchema>;

export async function generateRealtimeResult(input: GenerateRealtimeResultInput): Promise<GenerateRealtimeResultOutput> {
  return generateRealtimeResultFlow(input);
}

const generateRealtimeResultPrompt = ai.definePrompt({
  name: 'generateRealtimeResultPrompt',
  input: {schema: GenerateRealtimeResultInputSchema},
  // The prompt should only be responsible for generating the text result.
  output: {schema: z.object({result: z.string()})},
  prompt: `{{prompt}}`,
});

const generateRealtimeResultFlow = ai.defineFlow(
  {
    name: 'generateRealtimeResultFlow',
    inputSchema: GenerateRealtimeResultInputSchema,
    outputSchema: GenerateRealtimeResultOutputSchema,
  },
  async input => {
    const startTime = Date.now();
    const {output, usage} = await generateRealtimeResultPrompt(input);
    const endTime = Date.now();
    const latency = endTime - startTime;

    const resultText = output?.result || '';
    
    // Basic quality assignment logic. Could be replaced with a more sophisticated model.
    let quality = '🤔';
    if (resultText.length > 10) {
      quality = '👍';
    } else if (resultText.length > 5) {
      quality = '👌';
    }

    return {
      result: resultText,
      quality: quality,
      length: resultText.length,
      latency: latency,
      tokenUsage: usage.totalTokens,
    };
  }
);
