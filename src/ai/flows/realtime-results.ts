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
  model: z.string().describe('The model to use for generation.'),
  evaluationCriteria: z
    .string()
    .optional()
    .describe('Optional criteria to evaluate the quality of the result.'),
});
export type GenerateRealtimeResultInput = z.infer<
  typeof GenerateRealtimeResultInputSchema
>;

const QualityEvaluationSchema = z.object({
  score: z
    .number()
    .min(1)
    .max(5)
    .describe('A quality score from 1 to 5, where 5 is best.'),
  explanation: z.string().describe('A brief explanation for the given score.'),
});

const GenerateRealtimeResultOutputSchema = z.object({
  result: z.string().describe('The result from the LLM.'),
  quality: QualityEvaluationSchema.optional().describe(
    'An AI-powered quality evaluation of the result.'
  ),
  length: z.number().describe('The length of the result in characters.'),
  latency: z.number().describe('The latency of the LLM response in milliseconds.'),
  tokenUsage: z.number().describe('The number of tokens used by the LLM.'),
});
export type GenerateRealtimeResultOutput = z.infer<
  typeof GenerateRealtimeResultOutputSchema
>;

export async function generateRealtimeResult(
  input: GenerateRealtimeResultInput
): Promise<GenerateRealtimeResultOutput> {
  return generateRealtimeResultFlow(input);
}

const generateRealtimeResultPrompt = ai.definePrompt({
  name: 'generateRealtimeResultPrompt',
  input: {schema: z.object({prompt: z.string()})},
  // The prompt should only be responsible for generating the text result.
  output: {schema: z.object({result: z.string()})},
  prompt: `{{prompt}}`,
});

const qualityEvaluatorPrompt = ai.definePrompt({
  name: 'qualityEvaluatorPrompt',
  input: {
    schema: z.object({
      prompt: z.string(),
      result: z.string(),
      criteria: z.string(),
    }),
  },
  output: {schema: QualityEvaluationSchema},
  prompt: `You are an expert evaluator. Your task is to assess the quality of an AI-generated text based on a given prompt and specific evaluation criteria.

Please provide a score from 1 to 5 (where 1 is poor and 5 is excellent) and a brief explanation for your rating.

**Original Prompt:**
\`\`\`
{{prompt}}
\`\`\`

**Evaluation Criteria:**
\`\`\`
{{criteria}}
\`\`\`

**Generated Result to Evaluate:**
\`\`\`
{{result}}
\`\`\`
`,
});

const generateRealtimeResultFlow = ai.defineFlow(
  {
    name: 'generateRealtimeResultFlow',
    inputSchema: GenerateRealtimeResultInputSchema,
    outputSchema: GenerateRealtimeResultOutputSchema,
  },
  async input => {
    const startTime = Date.now();
    const {output, usage} = await generateRealtimeResultPrompt(
      {prompt: input.prompt},
      {model: `googleai/${input.model}`}
    );
    const endTime = Date.now();
    const latency = endTime - startTime;

    const resultText = output?.result || '';

    let quality;
    if (input.evaluationCriteria && resultText) {
      const evaluationResult = await qualityEvaluatorPrompt(
        {
          prompt: input.prompt,
          result: resultText,
          criteria: input.evaluationCriteria,
        },
        {model: 'googleai/gemini-1.5-flash'}
      ); // Use a fast model for evaluation
      quality = evaluationResult.output;
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
