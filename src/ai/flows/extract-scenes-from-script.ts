'use server';

/**
 * @fileOverview Extracts scenes from a script using AI.
 *
 * - extractScenesFromScript - A function that extracts scenes from a script.
 * - ExtractScenesFromScriptInput - The input type for the extractScenesFromScript function.
 * - ExtractScenesFromScriptOutput - The return type for the extractScenesFromScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractScenesFromScriptInputSchema = z.object({
  scriptContent: z.string().describe('The content of the script to extract scenes from.'),
});
export type ExtractScenesFromScriptInput = z.infer<typeof ExtractScenesFromScriptInputSchema>;

const ExtractScenesFromScriptOutputSchema = z.object({
  scenes: z.array(
    z.string().describe('A scene extracted from the script.')
  ).describe('The extracted scenes from the script.')
});
export type ExtractScenesFromScriptOutput = z.infer<typeof ExtractScenesFromScriptOutputSchema>;

export async function extractScenesFromScript(input: ExtractScenesFromScriptInput): Promise<ExtractScenesFromScriptOutput> {
  return extractScenesFromScriptFlow(input);
}

const extractScenesPrompt = ai.definePrompt({
  name: 'extractScenesPrompt',
  input: {schema: ExtractScenesFromScriptInputSchema},
  output: {schema: ExtractScenesFromScriptOutputSchema},
  prompt: `You are a script analysis expert. Your task is to extract individual scenes from the given script content.

  The scenes should be extracted as distinct chunks, preserving the order in the script. Each scene should be a descriptive text.

  Here is the script content:
  {{scriptContent}}
  `,
});

const extractScenesFromScriptFlow = ai.defineFlow(
  {
    name: 'extractScenesFromScriptFlow',
    inputSchema: ExtractScenesFromScriptInputSchema,
    outputSchema: ExtractScenesFromScriptOutputSchema,
  },
  async input => {
    const {output} = await extractScenesPrompt(input);
    return output!;
  }
);
