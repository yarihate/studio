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
const OLLAMA_MODEL = 'gemma3:12b';

const PROMPT_TEMPLATE = `You are a film scene extraction and structuring AI.
Your task is to read a Russian film script and segment the WHOLE SCRIPT into scenes and subscenes,
then output a valid JSON array that strictly follows the schema below.

No commentary, markdown, or text outside the JSON is allowed.
Always return a single valid JSON array, even if the script contains only one scene.

🧩 Main Goals

Identify all scene headers (ИНТ., НАТ., ДЕНЬ, НОЧЬ, ВЕЧЕР, УТРО, etc.).

Split each scene into subscenes (only visual, emotional, or event-based blocks).

Fill every field strictly based on the content of the script — no invention or improvisation.

Always return syntactically valid JSON that can be parsed using JSON.parse().

✅ Required JSON Schema

Each scene must follow this structure:

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
      "camera_hint": "",
      "props": []
    }
  ]
}


If there are multiple scenes, return them as a single JSON array:

[
  { ... },
  { ... }
]

⚙️ Rules & Validation Checks
1. Formatting

Output only raw JSON, no markdown, code fences, or explanations.

JSON must be directly parsable by JSON.parse() with no errors.

2. Field completeness

All keys must be present.

Empty values must use "", [], or {} as appropriate.

Do not remove or rename any keys.

🎞 Scene & Subscene Segmentation Rules
1. Scene Detection

A new scene begins only when a new line explicitly indicates a scene header:

ИНТ. or НАТ.

and/or a change of time indicator (ДЕНЬ, НОЧЬ, ВЕЧЕР, УТРО).

Example:

"8-1" → ИНТ. КАБИНЕТ ПСИХОЛОГА. ДЕНЬ

"8-2" → НАТ. ДВОР ШКОЛЫ. ВЕЧЕР

When a new header appears, start a new JSON scene object, not a subscene.

2. Subscene Detection

Create a subscene only when:

There is a visible visual or emotional change, such as an outburst, physical action, shift in focus, or pause.

The camera or focus of attention clearly changes.

A subscene should describe one complete visual or emotional moment, not individual lines.

3. Subscene Minimization Rule

Merge adjacent dialogue or micro-actions into a single subscene
if they occur in the same emotional state or physical space.

Do not fragment long dialogues — they belong to one subscene unless there is a visual change.

Each subscene should represent roughly 5–20 seconds of screen time.

4. Dialogue Exclusion Rule

Pure dialogue segments are not separate subscenes.

Dialogue can appear inside description only if it accompanies an action or emotional shift.

Multiple consecutive dialogue lines = one subscene, if no new visual change occurs.

🧠 Structure

scene_id = scene number (e.g., "8-1").

subscene_id = scene number + lowercase letter (e.g., "8-1a", "8-1b").

Each subscene represents one distinct visual or emotional beat.

Keep all subscenes in chronological order.

🌍 Language

Use Russian for all text fields.

Preserve original character names, lines, and dialogue fragments.

Do not translate or rephrase any Russian content.

🎥 Content Accuracy

Extract only explicit details: actions, settings, emotions, props.

Do not invent or add new information.

Keep descriptions short but visually informative.

⚠️ Sensitive Content

If a scene or subscene contains sensitive or restricted material (e.g., violence, sexual content):
⚠️ Do not stop processing. Replace the content with:

{
  "subscene_id": "8-5a",
  "description": "[ЗАЦЕНЗУРИРОВАНО: содержание скрыто]",
  "camera_hint": "",
  "props": []
}


Then continue generating the rest of the JSON normally.

🧱 Strict JSON Array Enforcement

Always return output as a JSON array.
Even if there is only one scene, it must be enclosed within an array:

✅ Correct:

[ { ... } ]


❌ Incorrect:

{ ... }

🧾 Example Output (for illustration)
[
  {
    "scene_id": "8-1",
    "scene_title": "ИНТ. КАБИНЕТ ПСИХОЛОГА. ДЕНЬ",
    "time_period": "2016",
    "characters": ["Арина (16)", "Психолог (40)"],
    "general_context": "Диалог между Ариной и психологом. Постепенно из безразличия вырастает эмоциональный срыв и исповедь.",
    "location": {
      "place": "Кабинет психолога в частной клинике, дневное освещение из окна.",
      "environment": "Комната с мягким диваном, креслом и спокойной атмосферой."
    },
    "cinematography": {
      "tone": "спокойный, напряжённый",
      "style": "реалистичный, камерный"
    },
    "subscenes": [
      {
        "subscene_id": "8-1a",
        "description": "Арина сидит с телефоном, скучает, отвечает односложно. Психолог пытается установить контакт.",
        "camera_hint": "средний план, дневной свет из окна",
        "props": ["телефон", "диван"]
      },
      {
        "subscene_id": "8-1b",
        "description": "Телефон начинает звонить. Арина не может сбросить вызов, злится и срывается на крик. Психолог сохраняет спокойствие.",
        "camera_hint": "крупный план лица и телефона, статичная камера",
        "props": ["телефон"]
      },
      {
        "subscene_id": "8-1c",
        "description": "После вспышки Арина успокаивается и рассказывает о прошлом, о похитителе и своих снах. Психолог помогает ей принять случившееся.",
        "camera_hint": "средний план, мягкое освещение, спокойный ритм",
        "props": []
      }
    ]
  }
]

✅ LLM Output Guards

Before returning the result, the model must internally check:

The output is a JSON array, not a single object.

All scene_id and subscene_id values are unique.

No dialogue-only blocks are treated as subscenes.

All required keys exist — none are missing or renamed.

Here is the script content to analyze:
  {{scriptContent}}
  `;

export async function extractScenesFromScript(input: ExtractScenesFromScriptInput): Promise<Scene[]> {
    const prompt = PROMPT_TEMPLATE.replace('{{scriptContent}}', input.scriptContent);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800000); // 30 minutes timeout

    try {
        const requestBody = {
            model: OLLAMA_MODEL,
            prompt: prompt,
            format: 'json',
            stream: false, // Wait for the full response
            options: {
              num_ctx: 16000,
              temperature: 0.1,
              top_p: 0.9
            }
        };

        console.log(`Sending request to Ollama at ${OLLAMA_URL} with model ${OLLAMA_MODEL}`);
        console.log('Ollama Request Body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Ollama request failed:', errorBody);
            throw new Error(`Ollama API request failed with status ${response.status}: ${errorBody}`);
        }

        const jsonResponse = await response.json();
        
        console.log('Received from Ollama (raw response):', jsonResponse.response);

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
