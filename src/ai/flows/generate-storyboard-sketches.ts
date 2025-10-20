// src/ai/flows/generate-storyboard-sketches.ts
'use server';
/**
 * @fileOverview Generates storyboard sketches for scenes extracted from a script.
 *
 * - generateStoryboardSketches - A function that generates storyboard sketches for a given scene description.
 * - GenerateStoryboardSketchesInput - The input type for the generateStoryboardSketches function.
 * - GenerateStoryboardSketchesOutput - The return type for the generateStoryboardSketches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryboardSketchesInputSchema = z.object({
  sceneDescription: z
    .string()
    .describe('The description of the scene to generate a storyboard sketch for.'),
});
export type GenerateStoryboardSketchesInput = z.infer<typeof GenerateStoryboardSketchesInputSchema>;

const GenerateStoryboardSketchesOutputSchema = z.object({
  sketchDataUri: z
    .string()
    .describe(
      'A data URI containing the generated storyboard sketch image, must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type GenerateStoryboardSketchesOutput = z.infer<typeof GenerateStoryboardSketchesOutputSchema>;

export async function generateStoryboardSketches(
  input: GenerateStoryboardSketchesInput
): Promise<GenerateStoryboardSketchesOutput> {
  return generateStoryboardSketchesFlow(input);
}

const storyboardSketchPrompt = ai.definePrompt({
  name: 'storyboardSketchPrompt',
  input: {schema: GenerateStoryboardSketchesInputSchema},
  output: {schema: GenerateStoryboardSketchesOutputSchema},
  prompt: `You are a storyboard artist. Create a storyboard sketch for the following scene description. The sketch should be black and white.

Scene Description: {{{sceneDescription}}}

Output the image as a data URI.

Ensure the sketch accurately represents the scene's key elements, characters, and mood.`, // Updated prompt
});

const generateStoryboardSketchesFlow = ai.defineFlow(
  {
    name: 'generateStoryboardSketchesFlow',
    inputSchema: GenerateStoryboardSketchesInputSchema,
    outputSchema: GenerateStoryboardSketchesOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Create a storyboard sketch for the following scene description. The sketch should be black and white.\n\nScene Description: ${input.sceneDescription}`,
    });
    return { sketchDataUri: media.url };
    //const {output} = await storyboardSketchPrompt(input);
    //return output!;
  }
);
