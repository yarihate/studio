'use server';
/**
 * @fileOverview A flow to translate text from Russian to English using a local Ollama instance.
 *
 * - translateToEnglish - A function that handles the translation.
 */

// We will use the same Ollama configuration as the scene extraction flow.
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'hf.co/unsloth/Qwen3-8B-GGUF:Q4_K_M';

const PROMPT_TEMPLATE = `You are an expert translator. Your task is to translate the following Russian text to English.
Output only the translated text, without any additional comments, explanations, or markdown.

Russian text:
"{{textToTranslate}}"

English translation:
`;

/**
 * Translates text from Russian to English using a local Ollama model.
 * @param text The Russian text to translate.
 * @returns The translated English text.
 */
export async function translateToEnglish(text: string): Promise<string> {
  const prompt = PROMPT_TEMPLATE.replace('{{textToTranslate}}', text);

  try {
    const requestBody = {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false, // For short translations, streaming is not necessary
    };

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      // A short timeout for a translation task
      signal: AbortSignal.timeout(180000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Ollama translation request failed:', errorBody);
      throw new Error(
        `Ollama API request failed with status ${response.status}: ${errorBody}`
      );
    }

    const jsonResponse = await response.json();
    
    // The actual text is in the 'response' field of the JSON object.
    const translatedText = jsonResponse.response?.trim() || '';

    return translatedText;

  } catch (error) {
    console.error('Error calling Ollama for translation:', error);
    // Return original text as a fallback
    return text;
  }
}
