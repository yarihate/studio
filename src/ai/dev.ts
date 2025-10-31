import { config } from 'dotenv';
config();

import '@/ai/flows/extract-scenes-from-script.ts';
import '@/ai/flows/generate-storyboard-sketches.ts';
import '@/ai/flows/extract-shots-from-scene.ts';
import '@/ai/flows/extract-text-from-docx.ts';
import '@/ai/flows/extract-text-from-pdf.ts';
