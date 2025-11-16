'use server';

import { extractTextFromDocx } from '@/ai/flows/extract-text-from-docx';
import { extractTextFromPdf } from '@/ai/flows/extract-text-from-pdf';
import { extractScenesFromScript } from '@/ai/flows/extract-scenes-from-script';
import { regenerateSketch } from '@/ai/flows/regenerate-sketch';
import { generateSketches } from '@/ai/flows/generate-sketches';
import { generateDetailedImages } from '@/ai/flows/generate-detailed-images';
import { generateMediumDetailedImages } from '@/ai/flows/generate-medium-detailed-images';
import type { Scene, SketchImage, DetailedImage, MediumDetailedImage, ImageStyle } from '@/types/script-vision';

async function getScriptContent(file: File): Promise<string> {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (file.type === 'application/pdf') {
        const result = await extractTextFromPdf({ pdfBuffer: fileBuffer });
        return result.text;
    }

    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await extractTextFromDocx({ docxBuffer: fileBuffer });
        return result.text;
    }
    
    if (file.type === 'text/plain' || file.name.endsWith('.doc')) {
        return fileBuffer.toString('utf-8');
    }

    throw new Error('Unsupported file type.');
}


export async function handleExtractScenesFromFile(formData: FormData): Promise<Scene[] | { error: string }> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided.');
    }

    const scriptContent = await getScriptContent(file);
    
    const scenes = await extractScenesFromScript({ scriptContent });
    return scenes;

  } catch (error) {
    console.error('Error extracting scenes:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to extract scenes from the script: ${errorMessage}` };
  }
}

export async function handleGenerateSketches(scene: Scene, style: ImageStyle): Promise<SketchImage[] | { error: string }> {
    try {
        const shotDetails = scene.subscenes.map(s => ({
          description: s.description,
          location: scene.location.place,
          props: s.props,
        }));
        
        const { sketches } = await generateSketches({ shotDetails, style });
        return sketches;

    } catch (error) {
        console.error('Error generating sketches:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to generate sketches: ${errorMessage}` };
    }
}

export async function handleGenerateMediumDetailedImages(scene: Scene, style: ImageStyle): Promise<MediumDetailedImage[] | { error: string }> {
    try {
        const shotDetails = scene.subscenes.map(s => ({
            description: s.description,
            location: scene.location.place,
            props: s.props,
        }));

        const { images } = await generateMediumDetailedImages({ shotDetails, style });

        const mediumDetailedImages: MediumDetailedImage[] = images.map((img, index) => ({
            id: Date.now() + index,
            sceneId: scene.scene_id,
            imageUrl: img.imageUrl,
            prompt: img.prompt,
        }));

        return mediumDetailedImages;

    } catch (error) {
        console.error('Error generating medium detailed images:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to generate medium detailed images: ${errorMessage}` };
    }
}


export async function handleGenerateDetailedImages(scene: Scene, style: ImageStyle): Promise<DetailedImage[] | { error: string }> {
    try {
        const shotDetails = scene.subscenes.map(s => ({
            description: s.description,
            location: scene.location.place,
            props: s.props,
        }));

        const { images } = await generateDetailedImages({ shotDetails, style });

        const detailedImages: DetailedImage[] = images.map((img, index) => ({
            id: Date.now() + index,
            sceneId: scene.scene_id,
            imageUrl: img.imageUrl,
            prompt: img.prompt,
        }));

        return detailedImages;

    } catch (error) {
        console.error('Error generating detailed images:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to generate detailed images: ${errorMessage}` };
    }
}

export async function handleRegenerateSketch(prompt: string): Promise<SketchImage | { error: string }> {
    try {
        if (!prompt) {
            throw new Error('No prompt provided.');
        }

        const { sketch } = await regenerateSketch({ prompt });
        return sketch;

    } catch (error) {
        console.error('Error regenerating sketch:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to regenerate sketch: ${errorMessage}` };
    }
}
