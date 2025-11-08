'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {genkitEval} from 'genkit/eval';
import {dotprompt} from 'genkit/dotprompt';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
    dotprompt(),
    genkitEval(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
