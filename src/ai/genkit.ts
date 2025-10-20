import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const google = googleAI({
  // This is required for text-to-image models like Imagen.
  apiVersion: 'v1beta',
});

export const ai = genkit({
  plugins: [google],
  model: 'googleai/gemini-2.5-flash',
  // Let's also define our image model here for easy reference.
  imageModel: 'googleai/imagen-4.0-fast-generate-001',
});
