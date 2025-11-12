'use server';
/**
 * @fileOverview Regenerates a single storyboard sketch by calling a local ComfyUI instance.
 *
 * - regenerateSketch - A function that regenerates a single sketch for a given prompt.
 * - RegenerateSketchInput - The input type for the regenerateSketch function.
 * - RegenerateSketchOutput - The return type for the regenerateSketch function.
 */
import { generateStoryboardSketches, ShotDetail } from './generate-storyboard-sketches';
import type { SketchImage } from '@/types/script-vision';

export interface RegenerateSketchInput {
  prompt: string;
}

export interface RegenerateSketchOutput {
  sketch: SketchImage;
}

// We can reuse the core logic from the multi-sketch generation flow.
// We just need a wrapper for a single prompt.
import { translateToEnglish } from './translate-to-english';
import { getImages } from './generate-storyboard-sketches';

export async function regenerateSketch(
  input: RegenerateSketchInput
): Promise<RegenerateSketchOutput> {
  console.log('Regenerating single sketch for prompt:', input.prompt);
  
  // The prompt from the UI is already constructed, but for consistency with the model,
  // we should ensure it's in English. The user might edit it in Russian.
  const translatedPrompt = await translateToEnglish(input.prompt);
  const finalPrompt = `sketch of ${translatedPrompt}`;
  
  const imageUrl = await getImages(translatedPrompt);

  const newSketchImage: SketchImage = {
      imageUrl,
      prompt: input.prompt, // Return the original, user-facing prompt
  };

  return { sketch: newSketchImage };
}
