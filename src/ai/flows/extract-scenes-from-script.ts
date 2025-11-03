'use server';

/**
 * @fileOverview Extracts scenes from a script using a direct call to Ollama.
 *
 * - extractScenesFromScript - A function that extracts scenes from a script.
 * - ExtractScenesFromScriptInput - The input type for the extractScenesFromScript function.
 * - ExtractScenesFromScriptOutput - The return type for the extractScenesFromScript function.
 */

import type { Scene } from '@/types/script-vision';

export interface ExtractScenesFromScriptInput {
  scriptContent: string;
}

export interface ExtractScenesFromScriptOutput {
    scenes: Scene[];
}

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'gemma3:27b';

const PROMPT_TEMPLATE = `You are a film scene extraction and structuring AI.
Your job is to read a Russian film script and segment WHOLE SCRIPT into scenes and subscenes, then output a valid JSON structure following the schema below.

 Main Goals

Identify all scene headers (ИНТ., НАТ., ДЕНЬ, НОЧЬ, etc.).

Split each scene into subscenes (эмоциональные, событийные, или визуальные блоки).

Fill each field in the schema strictly based on script content, without invention.

Output only JSON, with no explanations, markdown, or extra text.

Always ensure that the JSON is syntactically valid and fully parseable.

 Required JSON Schema

Each scene must strictly follow this format:

{
  "scene_id": "",
  "scene_title": "",
  "time_period": "",
  "characters": [],
  "general_context": "",
  "subscenes": [
    {
      "subscene_id": "",
      "description": "",
      "emotion": "",
      "camera_hint": "",
      "props": [],
      "dialogue_excerpt": ""
    }
  ]
}


If there are multiple scenes, return them as an array of JSON objects:

[
  { ... },
  { ... }
]

 Rules & Validation Checks
1. Formatting

Output only JSON, not markdown or text commentary.

No backticks, no extra symbols, no “Explanation:” sections.

JSON must be fully parsable by standard JSON.parse().

2. Field completeness

All keys from the schema must be present.

Empty values must be empty strings "" or empty arrays [].

Do not remove keys if data is missing.

scene_id and all subscene_id values must be unique.

3. Logical structure

scene_id = scene number (e.g. "8-1").

subscene_id = scene number + lowercase letter (e.g. "8-1a", "8-1b").

Each subscene must describe one visual or emotional beat.

Keep subscenes in chronological order.

4. Language

Use Russian for all text.

Preserve all Russian names and dialogue as written.

Do not translate or paraphrase.

5. Content accuracy

Extract only explicit details mentioned in the script.

Do not invent visuals or add hypothetical details.

Dialogue excerpts must be short (1–2 lines) and authentic.

6. Safety & fallback

If something cannot be extracted:

Leave the field empty ("" or []), but do not remove it.

If the script has no clear scenes, output an empty JSON array: [].

 Final Output Example

(for illustration only — model must not include commentary like this)

[
  {
    "scene_id": "8-1",
    "scene_title": "ИНТ. КАБИНЕТ ПСИХОЛОГА. ДЕНЬ",
    "time_period": "2016",
    "characters": ["Арина (16)", "Психолог (40)"],
    "general_context": "Диалог между Ариной и психологом. Отстраненность переходит в эмоциональный срыв и исповедь.",
    "subscenes": [
      {
        "subscene_id": "8-1a",
        "description": "Арина сидит с телефоном и скучает. Начинается диалог с психологом.",
        "emotion": "раздражение, равнодушие",
        "camera_hint": "средний план, дневной свет",
        "props": ["телефон", "диван"],
        "dialogue_excerpt": "АРИНА: Вы будете что-то спрашивать?"
      }
    ]
  }
]

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
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Ollama request failed:', errorBody);
            throw new Error(`Ollama API request failed with status ${response.status}: ${errorBody}`);
        }

        const responseData = await response.json();
        
        console.log('Received response from Ollama.');

        const jsonContent = JSON.parse(responseData.response);

        // The model returns the array directly
        return { scenes: jsonContent as Scene[] };

    } catch (error) {
        console.error('Error calling Ollama API:', error);
        throw error;
    }
}
