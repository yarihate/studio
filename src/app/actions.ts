'use server';

import { extractScenesFromScript } from '@/ai/flows/extract-scenes-from-script';
import { generateStoryboardSketches } from '@/ai/flows/generate-storyboard-sketches';

export async function handleExtractScenes(scriptContent: string) {
  try {
    if (!scriptContent.trim()) {
      throw new Error('Script content cannot be empty.');
    }
    const result = await extractScenesFromScript({ scriptContent });
    return { scenes: result.scenes };
  } catch (error) {
    console.error('Error extracting scenes:', error);
    return { error: 'Failed to extract scenes from the script.' };
  }
}

export async function handleGenerateSketch(sceneDescription: string) {
  try {
    const result = await generateStoryboardSketches({ sceneDescription });
    return { sketchDataUri: result.sketchDataUri };
  } catch (error) {
    console.error('Error generating sketch:', error);
    return { error: 'Failed to generate a sketch for the scene.' };
  }
}
