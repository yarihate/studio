'use server';

import { extractScenesFromScript } from '@/ai/flows/extract-scenes-from-script';
import { extractShotsFromScene } from '@/ai/flows/extract-shots-from-scene';
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

export async function handleGenerateSketchesForScene(sceneDescription: string) {
  try {
    // 1. Extract shots from the scene
    const shotsResult = await extractShotsFromScene({ sceneDescription });
    if (!shotsResult.shots || shotsResult.shots.length === 0) {
      // If no shots are extracted, use the whole scene description as a single shot.
      shotsResult.shots = [sceneDescription];
    }
    
    // 2. Generate sketches for each shot
    const sketchResult = await generateStoryboardSketches({ shotDescriptions: shotsResult.shots });
    return { sketchDataUris: sketchResult.sketchDataUris };
  } catch (error) {
    console.error('Error generating sketches:', error);
    return { error: 'Failed to generate sketches for the scene.' };
  }
}
