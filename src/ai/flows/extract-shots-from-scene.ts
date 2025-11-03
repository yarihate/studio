'use server';

/**
 * @fileOverview Extracts shots from a scene description using AI.
 * This file is a placeholder and uses mock data.
 *
 * - extractShotsFromScene - A function that extracts shots from a scene.
 * - ExtractShotsFromSceneInput - The input type for the extractShotsFromScene function.
 * - ExtractShotsFromSceneOutput - The return type for the extractShotsFromScene function.
 */

export interface ExtractShotsFromSceneInput {
  sceneDescription: string;
}

export interface ExtractShotsFromSceneOutput {
  shots: string[];
}

export async function extractShotsFromScene(input: ExtractShotsFromSceneInput): Promise<ExtractShotsFromSceneOutput> {
  // Mock implementation since Genkit was removed.
  console.log('Extracting shots for scene:', input.sceneDescription);
  
  const mockShots = [
    "Wide shot of the location.",
    "Medium shot of the main subject.",
    "Close-up on a key detail or expression.",
    "Action shot of the main event.",
  ];
  
  return Promise.resolve({ shots: mockShots });
}
