'use server';

import { extractTextFromDocx } from '@/ai/flows/extract-text-from-docx';
import { extractTextFromPdf } from '@/ai/flows/extract-text-from-pdf';
import { extractScenesFromScript } from '@/ai/flows/extract-scenes-from-script';
import { toast } from '@/hooks/use-toast';

async function getScriptContent(file: File): Promise<string> {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (file.type === 'application/pdf') {
        const result = await extractTextFromPdf({ pdfBuffer: fileBuffer });
        return result.text;
    }

    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await extractTextFromDocx({ docxBuffer: fileBuffer });
        return result.text;
    }
    
    if (file.type === 'text/plain' || file.name.endsWith('.doc')) {
        return fileBuffer.toString('utf-8');
    }

    throw new Error('Unsupported file type.');
}


export async function handleExtractScenesFromFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided.');
    }

    const scriptContent = await getScriptContent(file);

    if (!scriptContent.trim()) {
      throw new Error('Script content could not be extracted or is empty.');
    }
    const result = await extractScenesFromScript({ scriptContent });
    return { scenes: result.scenes };
  } catch (error) {
    console.error('Error extracting scenes:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to extract scenes from the script: ${errorMessage}` };
  }
}
