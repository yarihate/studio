'use server';
/**
 * @fileOverview Extracts text from a DOCX file buffer.
 *
 * - extractTextFromDocx - A function that extracts text from a DOCX buffer.
 * - ExtractTextFromDocxInput - The input type for the extractTextFromDocx function.
 * - ExtractTextFromDocxOutput - The return type for the extractTextFromDocx function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import mammoth from 'mammoth';

const ExtractTextFromDocxInputSchema = z.object({
  docxBuffer: z.instanceof(Buffer).describe('The buffer of the docx file.'),
});
export type ExtractTextFromDocxInput = z.infer<typeof ExtractTextFromDocxInputSchema>;

const ExtractTextFromDocxOutputSchema = z.object({
  text: z.string().describe('The extracted text content.'),
});
export type ExtractTextFromDocxOutput = z.infer<typeof ExtractTextFromDocxOutputSchema>;

export async function extractTextFromDocx(input: ExtractTextFromDocxInput): Promise<ExtractTextFromDocxOutput> {
  return extractTextFromDocxFlow(input);
}

const extractTextFromDocxFlow = ai.defineFlow(
  {
    name: 'extractTextFromDocxFlow',
    inputSchema: ExtractTextFromDocxInputSchema,
    outputSchema: ExtractTextFromDocxOutputSchema,
  },
  async input => {
    const { value } = await mammoth.extractRawText({ buffer: input.docxBuffer });
    return { text: value };
  }
);
