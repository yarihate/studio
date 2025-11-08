'use server';
/**
 * @fileOverview A flow to translate text from Russian to English.
 *
 * - translateToEnglish - A function that handles the translation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the input schema for the flow
const TranslateInputSchema = z.string().describe('Text in Russian to be translated to English.');
export type TranslateInput = z.infer<typeof TranslateInputSchema>;

// Define the output schema for the flow
const TranslateOutputSchema = z.string().describe('The translated text in English.');
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

// Define the prompt for the AI model
const translatePrompt = ai.definePrompt({
  name: 'translateToEnglishPrompt',
  input: { schema: TranslateInputSchema },
  output: { schema: TranslateOutputSchema },
  prompt: `Translate the following Russian text to English. Output only the translated text, without any additional comments or explanations.

Russian text: {{{input}}}
`,
});

// Define the Genkit flow
const translateToEnglishFlow = ai.defineFlow(
  {
    name: 'translateToEnglishFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async (input) => {
    const { output } = await translatePrompt(input);
    return output ?? '';
  }
);

/**
 * Translates text from Russian to English using an AI model.
 * @param text The Russian text to translate.
 * @returns The translated English text.
 */
export async function translateToEnglish(text: TranslateInput): Promise<TranslateOutput> {
  return await translateToEnglishFlow(text);
}
