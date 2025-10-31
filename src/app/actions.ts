'use server';

import { extractTextFromDocx } from '@/ai/flows/extract-text-from-docx';
import { extractTextFromPdf } from '@/ai/flows/extract-text-from-pdf';
import { extractScenesFromScript } from '@/ai/flows/extract-scenes-from-script';
import { toast } from '@/hooks/use-toast';

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


export async function handleExtractScenesFromFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided.');
    }

    // Mocking the scene extraction to avoid 503 errors from the AI service.
    const mockScenes = [
        {
          "description": "A tense standoff in a neon-lit alleyway at night.",
          "shot": {
            "composition": "Medium close-up, 50mm lens, ARRI Alexa, shallow depth of field.",
            "camera_motion": "Slow handheld shake to build tension."
          },
          "subjects": [
            {
              "name": "Kael",
              "description": "A 30-year-old detective, weary and resolute, with a scar above his right eye.",
              "wardrobe": "A rain-soaked trench coat over a simple shirt and tie."
            },
            {
              "name": "Lira",
              "description": "A 25-year-old informant, nervous but defiant, clutching a data chip.",
              "wardrobe": "A futuristic, reflective jacket and dark cargo pants."
            }
          ],
          "scene": {
            "location": "A narrow alley between towering skyscrapers in Neo-Kyoto.",
            "time_of_day": "Night",
            "environment": "Rain-slicked pavement reflecting holographic advertisements. Steam rises from sewer grates."
          },
          "visual_details": {
            "action": "Kael confronts Lira, who is cornered against a wall.",
            "props": "A discarded newspaper, overflowing dumpster, a flickering neon sign for 'The Serpent's Kiss' bar."
          },
          "cinematography": {
            "lighting": "Harsh, colored light from neon signs creates dramatic highlights and deep shadows. A single backlight rims the subjects.",
            "tone": "Tense, suspenseful, noir."
          }
        },
        {
          "description": "A serene moment of discovery in a lush, ancient forest.",
          "shot": {
            "composition": "Wide shot, 24mm lens, RED Dragon, deep depth of field.",
            "camera_motion": "Slow, smooth dolly-in towards the subject."
          },
          "subjects": [
            {
              "name": "Elara",
              "description": "A young botanist with bright, curious eyes and dirt-smudged cheeks.",
              "wardrobe": "Practical hiking gear, worn and comfortable."
            }
          ],
          "scene": {
            "location": "The heart of the Amazon rainforest, near a waterfall.",
            "time_of_day": "Midday",
            "environment": "Sunlight filters through the dense canopy, creating a dappled effect. The air is thick with humidity and the sound of birds."
          },
          "visual_details": {
            "action": "Elara gently touches a glowing, bioluminescent flower that has never been seen before.",
            "props": "A leather-bound research journal, a backpack with tools, the unique glowing flower."
          },
          "cinematography": {
            "lighting": "Natural, dappled sunlight, with the flower itself acting as a soft, magical key light.",
            "tone": "Wonder, discovery, peaceful."
          }
        }
      ];

    // This simulates a short delay as if the AI were processing the request.
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { scenes: mockScenes };

  } catch (error) {
    console.error('Error extracting scenes:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to extract scenes from the script: ${errorMessage}` };
  }
}
