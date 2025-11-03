'use server';
/**
 * @fileOverview Extracts text from a DOCX file buffer.
 *
 * - extractTextFromDocx - A function that extracts text from a DOCX buffer.
 * - ExtractTextFromDocxInput - The input type for the extractTextFromDocx function.
 * - ExtractTextFromDocxOutput - The return type for the extractTextFromDocx function.
 */

import mammoth from 'mammoth';

export interface ExtractTextFromDocxInput {
  docxBuffer: Buffer;
}

export interface ExtractTextFromDocxOutput {
  text: string;
}

export async function extractTextFromDocx(input: ExtractTextFromDocxInput): Promise<ExtractTextFromDocxOutput> {
  try {
    const { value } = await mammoth.extractRawText({ buffer: input.docxBuffer });
    return { text: value };
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from the DOCX file.');
  }
}
