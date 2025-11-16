'use server';
/**
 * @fileOverview Generates detailed, photorealistic images for scenes by calling a local ComfyUI instance.
 *
 * - generateDetailedImages - A function that generates detailed images for given shot descriptions.
 * - GenerateDetailedImagesInput - The input type for the generateDetailedImages function.
 * - GenerateDetailedImagesOutput - The return type for the generateDetailedImages function.
 */
import type { SketchImage, ImageStyle } from '@/types/script-vision';
import { translateToEnglish } from './translate-to-english';

const COMFYUI_URL = 'http://comfyui:8000/prompt';
const COMFYUI_OUTPUT_URL = 'http://comfyui:8000/view';

// This is a different, more photorealistic workflow for ComfyUI.
const COMFYUI_WORKFLOW_TEMPLATE = {
  "client_id": "a637d04a795f4262b7e07b4618e7d412",
  "prompt": {
    "3": {
      "inputs": {
        "seed": 857416130125438,
        "steps": 25,
        "cfg": 7,
        "sampler_name": "dpmpp_2m",
        "scheduler": "karras",
        "denoise": 1,
        "model": [
          "4",
          0
        ],
        "positive": [
          "6",
          0
        ],
        "negative": [
          "7",
          0
        ],
        "latent_image": [
          "5",
          0
        ]
      },
      "class_type": "KSampler",
      "_meta": {
        "title": "KSampler"
      }
    },
    "4": {
      "inputs": {
        "ckpt_name": "sd_xl_base_1.0.safetensors"
      },
      "class_type": "CheckpointLoaderSimple",
      "_meta": {
        "title": "Load Checkpoint"
      }
    },
    "5": {
      "inputs": {
        "width": 1024,
        "height": 1024,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage",
      "_meta": {
        "title": "Empty Latent Image"
      }
    },
    "6": {
      "inputs": {
        "text": "photograph of a beautiful woman, 20 years old, winter, cozy, cinematic, epic, soft light, volumetric light, very detailed, professional photo, 8k",
        "clip": [
          "4",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "7": {
      "inputs": {
        "text": "text, watermark, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, blurred, watermark, grainy, signature, cut off, draft",
        "clip": [
          "4",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "8": {
      "inputs": {
        "samples": [
          "3",
          0
        ],
        "vae": [
          "4",
          2
        ]
      },
      "class_type": "VAEDecode",
      "_meta": {
        "title": "VAE Decode"
      }
    },
    "9": {
      "inputs": {
        "filename_prefix": "ComfyUI_Detailed",
        "images": [
          "8",
          0
        ]
      },
      "class_type": "SaveImage",
      "_meta": {
        "title": "Save Image"
      }
    }
  }
};

const STYLE_SNIPPETS: Record<NonNullable<ImageStyle>, string> = {
  'Hyper-Realistic Natural': 'hyper-realistic portrait photography, natural lighting, high dynamic range, lifelike skin texture, detailed eyes and hair, minimal color grading, soft shadows, shallow depth of field, shot on high-end mirrorless camera',
  'Editorial / Fashion Cinematic': 'fashion editorial photography, cinematic soft lighting, glossy highlights, refined color palette, subtle professional retouching, high-end wardrobe styling, medium-format camera depth and clarity',
  'Filmic / 35mm Aesthetic': 'cinematic 35mm film aesthetic, soft ambient lighting, subtle film grain, warm tones, analog texture',
};


export interface ShotDetail {
  description: string;
  location: string;
  props: string[];
}

export interface GenerateDetailedImagesInput {
  shotDetails: ShotDetail[];
  style: ImageStyle;
}

export interface GenerateDetailedImagesOutput {
  images: SketchImage[];
}

async function getImagesFromComfyUI(promptText: string): Promise<string> {
  const requestBody = JSON.parse(JSON.stringify(COMFYUI_WORKFLOW_TEMPLATE));

  // Update the positive prompt in the workflow
  if (requestBody.prompt && requestBody.prompt['6'] && requestBody.prompt['6'].inputs) {
    requestBody.prompt['6'].inputs.text = promptText;
  }

  // Set a random seed for variety
  if (requestBody.prompt && requestBody.prompt['3'] && requestBody.prompt['3'].inputs) {
    requestBody.prompt['3'].inputs.seed = Math.floor(Math.random() * 1e15);
  }

  console.log('Sending to ComfyUI for detailed image:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(COMFYUI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('ComfyUI request failed:', errorBody);
    throw new Error(`ComfyUI API request failed with status ${response.status}: ${errorBody}`);
  }

  const jsonResponse = await response.json();
  const promptId = jsonResponse.prompt_id;
  if (!promptId) {
    throw new Error('Could not get prompt_id from ComfyUI response.');
  }

  // Poll for the result
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const historyResponse = await fetch(`http://comfyui:8000/history/${promptId}`);
        if (historyResponse.status === 404) {
          setTimeout(checkStatus, 2000);
          return;
        }
        if (!historyResponse.ok) {
          reject(new Error(`Failed to get history for prompt ${promptId}. Status: ${historyResponse.status}`));
          return;
        }

        const historyJson = await historyResponse.json();
        if (historyJson[promptId] && historyJson[promptId].outputs) {
          const outputs = historyJson[promptId].outputs;
          const saveImageNodeOutput = outputs['9']; // Node ID for "Save Image"

          if (saveImageNodeOutput && saveImageNodeOutput.images && saveImageNodeOutput.images.length > 0) {
            const imageData = saveImageNodeOutput.images[0];
            const imageUrl = `${COMFYUI_OUTPUT_URL}?filename=${imageData.filename}&subfolder=${imageData.subfolder}&type=${imageData.type}`;

            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
              reject(new Error(`Failed to fetch generated image from ${imageUrl}`));
              return;
            }
            const imageBuffer = await imageResponse.arrayBuffer();
            const imageBase64 = Buffer.from(imageBuffer).toString('base64');
            const mimeType = imageResponse.headers.get('content-type') || 'image/png';
            resolve(`data:${mimeType};base64,${imageBase64}`);
          } else {
            setTimeout(checkStatus, 2000);
          }
        } else {
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        console.error("Error while checking ComfyUI history:", error);
        setTimeout(checkStatus, 3000);
      }
    };
    checkStatus();
  });
}

export async function generateDetailedImages(
  input: GenerateDetailedImagesInput
): Promise<GenerateDetailedImagesOutput> {
  console.log('Generating detailed images for shots via ComfyUI:', input);

  const constructedPrompts = input.shotDetails.map(detail => {
    let prompt = `${detail.description}, in ${detail.location}`;
    if (detail.props.length > 0) {
      prompt += `, with props: ${detail.props.join(', ')}`;
    }
    return prompt;
  });

  const translatedPromises = constructedPrompts.map(desc => translateToEnglish(desc));
  const translatedDescriptions = await Promise.all(translatedPromises);

  const styleSnippet = input.style ? STYLE_SNIPPETS[input.style] : 'photograph, cinematic, 8k, ultra-realistic';
  
  const finalPrompts = translatedDescriptions.map(d => `${styleSnippet}, ${d}`);

  const imagePromises = finalPrompts.map(async (prompt, index) => {
    const imageUrl = await getImagesFromComfyUI(prompt);
    return {
      imageUrl,
      prompt: constructedPrompts[index],
    };
  });

  const images = await Promise.all(imagePromises);
  return { images };
}
