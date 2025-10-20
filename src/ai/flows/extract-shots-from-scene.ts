'use server';

/**
 * @fileOverview Extracts shots from a scene description using AI.
 *
 * - extractShotsFromScene - A function that extracts shots from a scene.
 * - ExtractShotsFromSceneInput - The input type for the extractShotsFromScene function.
 * - ExtractShotsFromSceneOutput - The return type for the extractShotsFromScene function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractShotsFromSceneInputSchema = z.object({
  sceneDescription: z.string().describe('The description of the scene to extract shots from.'),
});
export type ExtractShotsFromSceneInput = z.infer<typeof ExtractShotsFromSceneInputSchema>;

const ExtractShotsFromSceneOutputSchema = z.object({
  shots: z.array(
    z.string().describe('A single shot description, which is a specific visual moment or action within the scene.')
  ).describe('An array of shot descriptions extracted from the scene.')
});
export type ExtractShotsFromSceneOutput = z.infer<typeof ExtractShotsFromSceneOutputSchema>;

export async function extractShotsFromScene(input: ExtractShotsFromSceneInput): Promise<ExtractShotsFromSceneOutput> {
  return extractShotsFromSceneFlow(input);
}

const extractShotsPrompt = ai.definePrompt({
  name: 'extractShotsPrompt',
  input: {schema: ExtractShotsFromSceneInputSchema},
  output: {schema: ExtractShotsFromSceneOutputSchema},
  prompt: `You are a film director. Your task is to read a scene description and break it down into individual camera shots. Each shot should represent a distinct visual moment.

  For example, if the scene is "A man enters a room, walks to the window, and looks out at the rain.", you could break it down into:
  1. Wide shot of the room as the man enters.
  2. Medium shot of the man walking towards the window.
  3. Close-up on the man's face as he looks out.
  4. Point-of-view shot from the man's perspective, looking at the rain-streaked window pane.

  Extract the shots from the following scene description:
  {{sceneDescription}}
  `,
});

const extractShotsFromSceneFlow = ai.defineFlow(
  {
    name: 'extractShotsFromSceneFlow',
    inputSchema: ExtractShotsFromSceneInputSchema,
    outputSchema: ExtractShotsFromSceneOutputSchema,
  },
  async input => {
    const {output} = await extractShotsPrompt(input);
    return output!;
  }
);
