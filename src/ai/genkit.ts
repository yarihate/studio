import {genkit} from 'genkit';
import {openAI} from 'genkitx-openai';

// Определяем модель, которую будем использовать
const localLlm = process.env.LOCAL_LLM_NAME || 'qwen';

export const ai = genkit({
  plugins: [
    // Подключаем плагин OpenAI
    openAI({
      // Указываем базовый URL вашего локального сервера Ollama
      baseURL: 'http://localhost:11434/v1',
      // Указываем API ключ (для Ollama это может быть просто 'ollama')
      apiKey: 'ollama',
    }),
  ],
  models: [
    {
      name: `openai/${localLlm}`, // Регистрируем вашу локальную модель в Genkit
      path: `openai/${localLlm}`,
    },
  ],
  defaultModel: `openai/${localLlm}`, // Устанавливаем её как модель по умолчанию
});
