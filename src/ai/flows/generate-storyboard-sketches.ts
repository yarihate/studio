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
  shotDescriptions: z
    .array(z.string())
    .describe('The descriptions of the shots to generate storyboard sketches for.'),
});
export type GenerateStoryboardSketchesInput = z.infer<typeof GenerateStoryboardSketchesInputSchema>;

const GenerateStoryboardSketchesOutputSchema = z.object({
  sketchDataUris: z
    .array(z.string())
    .describe(
      'An array of data URIs for the generated storyboard sketch images.'
    ),
});
export type GenerateStoryboardSketchesOutput = z.infer<typeof GenerateStoryboardSketchesOutputSchema>;

export async function generateStoryboardSketches(
  input: GenerateStoryboardSketchesInput
): Promise<GenerateStoryboardSketchesOutput> {
  return generateStoryboardSketchesFlow(input);
}

const generateStoryboardSketchesFlow = ai.defineFlow(
  {
    name: 'generateStoryboardSketchesFlow',
    inputSchema: GenerateStoryboardSketchesInputSchema,
    outputSchema: GenerateStoryboardSketchesOutputSchema,
  },
  async input => {
    const sketchPromises = input.shotDescriptions.map(async (shot) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-image-preview',
            prompt: `Create a storyboard sketch for the following scene description. The sketch should be in a cinematic, black and white, pencil sketch style.\n\nScene Description: ${shot}`,
            config: {
                responseModalities: ['IMAGE', 'TEXT'],
            }
        });
        return media.url;
    });

    const sketchDataUris = await Promise.all(sketchPromises);
    return { sketchDataUris };
  }
);
