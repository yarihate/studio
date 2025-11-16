'use server';
/**
 * @fileOverview Regenerates a single storyboard sketch by calling a local ComfyUI instance.
 *
 * - regenerateSketch - A function that regenerates a single sketch for a given prompt.
 * - RegenerateSketchInput - The input type for the regenerateSketch function.
 * - RegenerateSketchOutput - The return type for the regenerateSketch function.
 */
import type { SketchImage } from '@/types/script-vision';
import { translateToEnglish } from './translate-to-english';
import { getImagesFromComfyUI } from './generate-sketches';

export interface RegenerateSketchInput {
  prompt: string;
}

export interface RegenerateSketchOutput {
  sketch: SketchImage;
}


export async function regenerateSketch(
  input: RegenerateSketchInput
): Promise<RegenerateSketchOutput> {
  console.log('Regenerating single sketch for prompt:', input.prompt);
  
  const translatedPrompt = await translateToEnglish(input.prompt);
  const finalPrompt = `sketch of ${translatedPrompt}`;
  
  const imageUrl = await getImagesFromComfyUI(finalPrompt);

  const newSketchImage: SketchImage = {
      imageUrl,
      prompt: input.prompt, // Return the original, user-facing prompt
  };

  return { sketch: newSketchImage };
}
