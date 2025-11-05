'use server';

/**
 * @fileOverview Extracts scenes from a script using a direct, non-streaming call to Ollama.
 *
 * - extractScenesFromScript - A function that initiates a request to Ollama and waits for the full response.
 * - ExtractScenesFromScriptInput - The input type for the extractScenesFromScript function.
 */

import type { Scene } from '@/types/script-vision';

export interface ExtractScenesFromScriptInput {
  scriptContent: string;
}

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'gemma3:27b';

const PROMPT_TEMPLATE = `You are a film scene extraction and structuring AI.
Your job is to read a Russian film script and segment the WHOLE SCRIPT into scenes and subscenes, then output a valid JSON array strictly following the schema below.

No commentary, markdown, or text outside the JSON is allowed.
Always output a single valid JSON array, even if the script contains only one scene.

Main Goals

Identify all scene headers (ИНТ., НАТ., ДЕНЬ, НОЧЬ, etc.).

Split each scene into subscenes (эмоциональные, событийные или визуальные блоки).

Fill every field in the schema strictly based on script content (no invention).

Always produce syntactically valid JSON that can be parsed via JSON.parse().

Required JSON Schema

Each scene must follow this structure:
[
{
"scene_id": "",
"scene_title": "",
"time_period": "",
"characters": [],
"general_context": "",
"location": {
"place": "",
"environment": ""
},
"cinematography": {
"tone": "",
"style": ""
},
"subscenes": [
{
"subscene_id": "",
"description": "",
"emotion": "",
"camera_hint": "",
"props": [],
"dialogue_excerpt": "",
"location": {
"place": "",
"environment": ""
},
"cinematography": {
"tone": "",
"style": ""
}
}
]
}
]

Rules & Validation Checks

1. Formatting

Output only raw JSON, no markdown, code fences, or explanations.

The result must be directly parseable using JSON.parse() without errors.

2. Field completeness

All keys from the schema must be present in every object.

If information is missing → use "" for strings, [] for arrays, {} for nested objects.

Never remove keys.

3. Structure

scene_id = scene number (e.g., "8-1").

subscene_id = scene number + lowercase letter (e.g., "8-1a", "8-1b").

Each subscene represents one emotional or visual beat.

Keep subscenes in chronological order.

4. Language

Use Russian for all textual fields.

Preserve all Russian names, lines, and dialogue.

Do not translate or rephrase.

5. Content accuracy

Extract only explicit details found in the script.

Do not invent visuals or dialogue.

Keep dialogue excerpts short (1–2 lines).

6. Sensitive content

If a scene or subscene contains sensitive or restricted material (violence, sexual content, etc.),
do not stop processing. Instead, replace the content as follows:
[
{
"subscene_id": "8-5a",
"description": "[ЗАЦЕНЗУРИРОВАНО: содержание скрыто]",
"emotion": "напряжение, тревога",
"camera_hint": "",
"props": [],
"dialogue_excerpt": "[ЗАЦЕНЗУРИРОВАНО]",
"location": {},
"cinematography": {
"tone": "",
"style": ""
}
}
]


Continue generating the rest of the JSON normally.

7. Strict JSON Array Enforcement (🚨 NEW RULE)

The final output must always be a JSON array.

Even if the script contains only one scene — wrap that single object in an array:

[ { ... } ]


Do not output standalone JSON objects.

Do not output text before or after the array.

Failure to output a JSON array is considered a formatting error.

Here is the script content to analyze:
  {{scriptContent}}
  `;

export async function extractScenesFromScript(input: ExtractScenesFromScriptInput): Promise<Scene[]> {
    const prompt = PROMPT_TEMPLATE.replace('{{scriptContent}}', input.scriptContent);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800000); // 30 minutes timeout

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
                stream: false, // Wait for the full response
                options: {
                    context_length: 16000
                }
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Ollama request failed:', errorBody);
            throw new Error(`Ollama API request failed with status ${response.status}: ${errorBody}`);
        }

        const jsonResponse = await response.json();
        
        // Log the raw response from Ollama
        console.log('Received from Ollama:', jsonResponse.response);

        const jsonContent = JSON.parse(jsonResponse.response);
        
        if (!Array.isArray(jsonContent)) {
            throw new Error('Ollama did not return a valid JSON array.');
        }

        return jsonContent as Scene[];

    } catch (error) {
        clearTimeout(timeoutId); // Also clear timeout on error
        console.error('Error calling or parsing Ollama API response:', error);
        throw error;
    }
}
