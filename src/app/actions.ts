'use server';

import { extractScenesFromScript } from '@/ai/flows/extract-scenes-from-script';
import { extractShotsFromScene } from '@/ai/flows/extract-shots-from-scene';
// This import is no longer used for mock data but we will keep it for now.
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
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to extract scenes from the script: ${errorMessage}` };
  }
}

export async function handleGenerateSketchesForScene(sceneDescription: string) {
  try {
    // 1. Extract shots from the scene to determine how many mock images to create.
    const shotsResult = await extractShotsFromScene({ sceneDescription });
    if (!shotsResult.shots || shotsResult.shots.length === 0) {
      shotsResult.shots = [sceneDescription];
    }
    
    // 2. Generate mock images for each shot.
    // We'll simulate a delay to make it feel like a real network request.
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockSketchDataUris = shotsResult.shots.map((_, index) => {
        // Use a unique seed for each image to get different placeholders.
        const seed = Date.now() + index;
        return `https://picsum.photos/seed/${seed}/1024/576`;
    });

    return { sketchDataUris: mockSketchDataUris };

  } catch (error) {
    console.error('Error generating mock sketches:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to generate sketches for the scene: ${errorMessage}` };
  }
}
