'use server';
/**
 * @fileOverview Extracts text from a PDF file buffer.
 *
 * - extractTextFromPdf - A function that extracts text from a PDF buffer.
 * - ExtractTextFromPdfInput - The input type for the extractTextFromPdf function
 * - ExtractTextFromPdfOutput - The return type for the extractTextFromPdf function.
 */

import pdf from 'pdf-parse';

export interface ExtractTextFromPdfInput {
  pdfBuffer: Buffer;
}

export interface ExtractTextFromPdfOutput {
  text: string;
}

export async function extractTextFromPdf(input: ExtractTextFromPdfInput): Promise<ExtractTextFromPdfOutput> {
  try {
    const data = await pdf(input.pdfBuffer);
    return { text: data.text };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from the PDF file.');
  }
}
