// src/ai/flows/prompt-optimizer.ts
'use server';
/**
 * @fileOverview A prompt optimizer AI agent.
 *
 * - promptOptimizer - A function that handles the prompt optimization process.
 * - PromptOptimizerInput - The input type for the promptOptimizer function.
 * - PromptOptimizerOutput - The return type for the promptOptimizer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PromptOptimizerInputSchema = z.object({
  prompt: z.string().describe('The prompt to be optimized.'),
  model: z.string().describe('The model to use for optimization.'),
});
export type PromptOptimizerInput = z.infer<typeof PromptOptimizerInputSchema>;

const PromptOptimizerOutputSchema = z.object({
  optimizedPrompt: z.string().describe('The optimized version of the prompt.'),
  explanation: z
    .string()
    .describe('An explanation of the changes made to the prompt.'),
});
export type PromptOptimizerOutput = z.infer<typeof PromptOptimizerOutputSchema>;

export async function promptOptimizer(input: PromptOptimizerInput): Promise<PromptOptimizerOutput> {
  return promptOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'promptOptimizerPrompt',
  input: {schema: z.object({prompt: z.string()})},
  output: {schema: PromptOptimizerOutputSchema},
  prompt: `You are an expert prompt engineer. Your job is to take a user-provided prompt and improve it.

Here is the prompt to improve:

{{prompt}}

Respond with the optimized prompt and an explanation of the changes you made. Be concise.

{{output}}
`,
});

const promptOptimizerFlow = ai.defineFlow(
  {
    name: 'promptOptimizerFlow',
    inputSchema: PromptOptimizerInputSchema,
    outputSchema: PromptOptimizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(
      {prompt: input.prompt},
      {model: `googleai/${input.model}`}
    );
    return output!;
  }
);
