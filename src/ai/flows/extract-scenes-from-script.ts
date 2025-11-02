'use server';

/**
 * @fileOverview Extracts scenes from a script using AI.
 *
 * - extractScenesFromScript - A function that extracts scenes from a script.
 * - ExtractScenesFromScriptInput - The input type for the extractScenesFromScript function.
 * - ExtractScenesFromScriptOutput - The return type for the extractScenesFromScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SceneDetailsSchema } from '@/types/script-vision';

const ExtractScenesFromScriptInputSchema = z.object({
  scriptContent: z.string().describe('The content of the script to extract scenes from.'),
});
export type ExtractScenesFromScriptInput = z.infer<typeof ExtractScenesFromScriptInputSchema>;


const ExtractScenesFromScriptOutputSchema = z.object({
    scenes: z.array(SceneDetailsSchema).describe('The extracted scenes from the script.'),
});

export type ExtractScenesFromScriptOutput = z.infer<typeof ExtractScenesFromScriptOutputSchema>;

export async function extractScenesFromScript(input: ExtractScenesFromScriptInput): Promise<ExtractScenesFromScriptOutput> {
  return extractScenesFromScriptFlow(input);
}

const extractScenesPrompt = ai.definePrompt({
  name: 'extractScenesPrompt',
  input: {schema: ExtractScenesFromScriptInputSchema},
  output: {schema: ExtractScenesFromScriptOutputSchema},
  prompt: `You are an experienced film concept designer. Your task is to analyze the provided script and break it down into distinct scenes. For each scene, you must extract detailed information and format it into a JSON object. Please strictly adhere to the following JSON structure and content specifications.

--------------------------------------------------------------------------------
**JSON Structure Template For Each Scene:**
{
  "description": "A one-sentence summary of the scene.",
  "shot": {
    "composition": "Describe shot type (e.g., wide shot, medium shot, close-up), focal length, camera, and depth of field.",
    "camera_motion": "Describe camera movement (e.g., static, pan, dolly, crane)."
  },
  "subjects": [
    {
      "name": "The name of the subject (e.g., 'Sarah', 'The Creature').",
      "description": "Detailed description of a main subject (character, animal, or object), including appearance, age, ethnicity, and unique features.",
      "wardrobe": "Describe the subject's clothing. Use 'N/A' if not applicable."
    }
  ],
  "scene": {
    "location": "Specify the exact location.",
    "time_of_day": "Specify the time (e.g., dawn, midday, night).",
    "environment": "Describe the surrounding environment and atmosphere."
  },
  "visual_details": {
    "action": "A summary of the main action in the scene.",
    "props": "List all relevant props. Use 'N/A' if there are none."
  },
  "cinematography": {
    "lighting": "Describe the lighting (e.g., natural light, campfire, soft HDR).",
    "tone": "Describe the emotional or stylistic feel (e.g., fierce, mystical, dreamy, realistic)."
  }
}
--------------------------------------------------------------------------------
**Content Generation Guidelines:**

*   **Scene Separation**: Identify each distinct scene in the script. A scene is defined by a change in location or a significant jump in time.
*   **Subjects Array**: The "subjects" field must be an array, even if there is only one subject. Identify every distinct subject in the scene and create a separate object for each within the "subjects" array. Ensure the "name" field is populated with the subject's name as identified in the script.
*   **Granularity of Detail**: Fill in each field with as much specific detail as can be inferred from the script. If a detail is not present, use a sensible default or state that it's not specified.
*   **Consistency**: Ensure every scene object in the output array follows the specified JSON structure.
*   **Language**: Use clear, concise, professional filmmaking terminology.

Here is the script content to analyze:
  {{scriptContent}}
  `,
});

const extractScenesFromScriptFlow = ai.defineFlow(
  {
    name: 'extractScenesFromScriptFlow',
    inputSchema: ExtractScenesFromScriptInputSchema,
    outputSchema: ExtractScenesFromScriptOutputSchema,
  },
  async (input) => {
    const {output} = await extractScenesPrompt(input);
    return output!;
  }
);
