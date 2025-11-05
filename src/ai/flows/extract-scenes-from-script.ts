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
Your job is to read a Russian film script and segment the WHOLE SCRIPT into scenes and subscenes,
then output a valid JSON array strictly following the schema below.

No commentary, markdown, or text outside the JSON is allowed.
Always output a single valid JSON array, even if the script contains only one scene.

Main Goals

Identify all scene headers (ИНТ., НАТ., ДЕНЬ, НОЧЬ, etc.).

Split each scene into subscenes (эмоциональные, событийные или визуальные блоки).

Fill every field in the schema strictly based on script content (no invention).

Always produce syntactically valid JSON that can be parsed via JSON.parse().

Required JSON Schema

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

Rules & Validation Checks
1. Formatting

Output only raw JSON, no markdown, code fences, or explanations.

The result must be directly parseable by JSON.parse() without errors.

2. Field completeness

All keys from the schema must be present in every object.

If information is missing → use "" for strings, [] for arrays, or {} for nested objects.

Never remove or rename keys.

3. Structure

scene_id = scene number (e.g., "8-1").

subscene_id = scene number + lowercase letter (e.g., "8-1a", "8-1b").

Each subscene = one distinct visual or emotional beat.

Keep subscenes in chronological order.

Important Rule — Dialogue Handling:
Dialogues alone (without any physical or emotional change, camera shift, or visual beat)
must not be extracted as separate subscenes.
Dialogues can be included inside a subscene’s description only if they illustrate a visible action, emotion, or dynamic shift.

4. Language

Use Russian for all text fields.

Preserve original character names and dialogue fragments inside descriptions.

Do not translate or rephrase any Russian content.

5. Content accuracy

Extract only explicit information from the script.

Do not invent visuals, tone, or props not mentioned.

Keep the descriptions concise but informative.

6. Sensitive content

If a scene or subscene contains sensitive or restricted material (e.g., violence, sexual content):
Do not stop processing. Replace the content with:

{
  "subscene_id": "8-5a",
  "description": "[ЗАЦЕНЗУРИРОВАНО: содержание скрыто]",
  "camera_hint": "",
  "props": []
}


Then continue generating the rest of the JSON normally.

7. Strict JSON Array Enforcement

The final output must always be a JSON array — even if there is only one scene.

Correct:

[ { ... } ]


Incorrect:

{ ... }

🧾 Example Output (for illustration)
[
  {
    "scene_id": "8-1",
    "scene_title": "ИНТ. КАБИНЕТ ПСИХОЛОГА. ДЕНЬ",
    "time_period": "2016",
    "characters": ["Арина (16)", "Психолог (40)"],
    "general_context": "Диалог между Ариной и психологом. Отстраненность переходит в эмоциональный срыв и исповедь.",
    "location": {
      "place": "Кабинет психолога в частной клинике, дневное освещение из окна.",
      "environment": "Комната с мягким диваном, столом и приглушённым светом."
    },
    "cinematography": {
      "tone": "спокойный, напряжённый",
      "style": "реалистичный, камерный"
    },
    "subscenes": [
      {
        "subscene_id": "8-1a",
        "description": "Арина сидит с телефоном, скучает, отвечает на вопросы психолога.",
        "camera_hint": "средний план, дневной свет из окна",
        "props": ["телефон", "диван"]
      },
      {
        "subscene_id": "8-1b",
        "description": "Телефон глючит, Арина в панике кричит в громкую связь. Психолог сохраняет спокойствие.",
        "camera_hint": "крупный план лица, статичная камера",
        "props": ["телефон"]
      },
      {
        "subscene_id": "8-1c",
        "description": "После вспышки истерики Арина успокаивается, делится болью о прошлом и своём похитителе.",
        "camera_hint": "средний план, мягкое освещение",
        "props": []
      }
    ]
  }
]

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
