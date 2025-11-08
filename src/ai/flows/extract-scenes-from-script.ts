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
const OLLAMA_MODEL = 'hf.co/unsloth/Qwen3-14B-GGUF:Q5_K_M';

const PROMPT_TEMPLATE = `You are a film scene extraction and structuring AI.

Your goal: read a full Russian film script and split it into scenes and subscenes.
Always output a single valid JSON array that strictly follows the schema below.
Do not include explanations, markdown, or any text outside the JSON.

Main objectives:

Identify all scene headers (e.g. "ИНТ.", "НАТ.", "ДЕНЬ.", "НОЧЬ.", and numbered tags like "8-1", "8-2").

Every new header = new scene.

Each scene should have 2–6 subscenes maximum (focus on emotional or visual changes only).

Dialogue exchanges alone DO NOT count as subscenes.

Keep everything in Russian.

Return JSON that is directly parsable by JSON.parse().

JSON SCHEMA

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

If there are several scenes, output them all as a single JSON array:
[
{ ... },
{ ... },
...
]

Rules and validation:

Output format

Output only one JSON array.

No markdown, no code fences, no text before or after JSON.

Scene detection

Every new heading (ИНТ./НАТ./ДЕНЬ./НОЧЬ. or numeric like 8-2, 9-1) starts a new scene.

Each scene_id must match that header exactly.

Subscenes belong only to their parent scene.

Subscenes

Each subscene = one emotional or visual beat.

Ignore micro-dialogues that do not change the mood or action.

Combine small dialogue blocks into one subscene if they occur in the same tone or setting.

Maximum 6 subscenes per scene.

Language

Use Russian for all text.

Keep character names and context as in the script (no translation or paraphrase).

Missing info

Use "" for missing strings, [] for arrays, {} for nested objects.

Never remove keys.

Sensitive content

If restricted or violent content appears, replace description with "ЗАЦЕНЗУРИРОВАНО" but continue processing the rest of the script.

Array enforcement

Always wrap all scenes in an array.

Even if there is only one scene, output [ { ... } ].

Do not output plain objects or text outside JSON.

Example output

[
{
"scene_id": "8-1",
"scene_title": "ИНТ. КАБИНЕТ ПСИХОЛОГА. ДЕНЬ",
"time_period": "2016",
"characters": ["Арина (16)", "Психолог (40)"],
"general_context": "Первая встреча Арины и психолога. Отстранённость сменяется срывом и исповедью.",
"location": {
"place": "Кабинет психолога в частной клинике.",
"environment": "Мягкий дневной свет из окна, спокойная обстановка."
},
"cinematography": {
"tone": "напряжённый, реалистичный",
"style": "камерный, статичный"
},
"subscenes": [
{
"subscene_id": "8-1a",
"description": "Арина сидит с телефоном, отстранённо отвечает на вопросы психолога.",
"camera_hint": "средний план, естественный свет",
"props": ["телефон", "диван"]
},
{
"subscene_id": "8-1b",
"description": "Арина срывается, кричит в телефон, затем плачет. Психолог спокойно наблюдает.",
"camera_hint": "крупный план лица, мягкое освещение",
"props": ["телефон"]
}
]
},
{
"scene_id": "8-2",
"scene_title": "НАТ. УЛИЦА. ВЕЧЕР",
"time_period": "2016",
"characters": ["Арина"],
"general_context": "Арина выходит из клиники, её эмоциональное состояние стабилизируется.",
"location": {
"place": "Улица у здания клиники.",
"environment": "Вечерний свет, прохладный воздух."
},
"cinematography": {
"tone": "спокойный, меланхоличный",
"style": "реалистичный, плавный"
},
"subscenes": [
{
"subscene_id": "8-2a",
"description": "Арина выходит из здания и медленно идёт по улице, делая глубокий вдох.",
"camera_hint": "широкий план, закатный свет",
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
              num_ctx: 40960,
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
