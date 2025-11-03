'use server';

/**
 * @fileOverview Extracts scenes from a script using a direct call to Ollama.
 *
 * - extractScenesFromScript - A function that extracts scenes from a script.
 * - ExtractScenesFromScriptInput - The input type for the extractScenesFromScript function.
 * - ExtractScenesFromScriptOutput - The return type for the extractScenesFromScript function.
 */

import type { SceneDetails } from '@/types/script-vision';

export interface ExtractScenesFromScriptInput {
  scriptContent: string;
}

export interface ExtractScenesFromScriptOutput {
    scenes: SceneDetails[];
}

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'gemma3:27b';

const PROMPT_TEMPLATE = `You are an experienced film concept designer. Your task is to analyze the provided script and break it down into distinct scenes. For each scene, you must extract detailed information and format it into a JSON object. Please strictly adhere to the following JSON structure and content specifications.

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
*   **IMPORTANT**: Your output must be ONLY the JSON object containing the array of scenes, with no additional text or explanations before or after it.

Here is the script content to analyze:
  {{scriptContent}}
  `;

export async function extractScenesFromScript(input: ExtractScenesFromScriptInput): Promise<ExtractScenesFromScriptOutput> {
    const prompt = PROMPT_TEMPLATE.replace('{{scriptContent}}', input.scriptContent);

    try {
        console.log(`Sending request to Ollama at ${OLLAMA_URL} with model ${OLLAMA_MODEL}`);

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                format: 'json',
                stream: false, // We ask for a single response, not a stream
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Ollama request failed:', errorBody);
            throw new Error(`Ollama API request failed with status ${response.status}: ${errorBody}`);
        }

        const responseData = await response.json();
        
        console.log('Received response from Ollama.');

        // The actual JSON content is in the `response` property of the returned object
        const jsonContent = JSON.parse(responseData.response);

        // The top-level object from the model should match our output schema
        return jsonContent as ExtractScenesFromScriptOutput;

    } catch (error) {
        console.error('Error calling Ollama API:', error);
        throw error;
    }
}
