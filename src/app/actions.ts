'use server';

import { extractScenesFromScript } from '@/ai/flows/extract-scenes-from-script';
import { extractShotsFromScene } from '@/ai/flows/extract-shots-from-scene';
import { generateStoryboardSketches } from '@/ai/flows/generate-storyboard-sketches';
import { toast } from '@/hooks/use-toast';

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
      if (!sceneDescription.trim()) {
        throw new Error('Scene description cannot be empty.');
      }
      
      const shotsResult = await extractShotsFromScene({ sceneDescription });
      
      if (shotsResult.error || !shotsResult.shots) {
         throw new Error(shotsResult.error || 'Failed to extract shots from the scene.');
      }

      if (shotsResult.shots.length === 0) {
        // If no shots are extracted, use the whole scene description for one sketch.
        shotsResult.shots = [sceneDescription];
      }
      
      const sketchResult = await generateStoryboardSketches({ shotDescriptions: shotsResult.shots });

      if (sketchResult.error || !sketchResult.sketchDataUris) {
        throw new Error(sketchResult.error || 'Failed to generate sketches.');
      }

      return { sketchDataUris: sketchResult.sketchDataUris };

    } catch (error) {
      console.error('Error in handleGenerateSketchesForScene:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { error: `Failed to generate sketches for the scene: ${errorMessage}` };
    }
}
