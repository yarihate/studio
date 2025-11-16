'use server';
/**
 * @fileOverview Generates medium-detailed images for scenes by calling a local ComfyUI instance with a specific Qwen workflow.
 *
 * - generateMediumDetailedImages - A function that generates images for given shot descriptions.
 * - GenerateMediumDetailedImagesInput - The input type for the function.
 * - GenerateMediumDetailedImagesOutput - The return type for the function.
 */
import type { SketchImage } from '@/types/script-vision';
import { translateToEnglish } from './translate-to-english';

const COMFYUI_URL = 'http://comfyui:8000/prompt';
const COMFYUI_OUTPUT_URL = 'http://comfyui:8000/view';

// This is the specific workflow for Medium Detailed Qwen-Image generation.
const COMFYUI_WORKFLOW_TEMPLATE = {
    "client_id":"088a66ccf953490db40dfef8add0c1b7",
    "prompt":{
        "60":{"inputs":{"filename_prefix":"ComfyUI_Medium","images":["75:8",0]},"class_type":"SaveImage"},
        "75:58":{"inputs":{"width":1024,"height":1024,"batch_size":1},"class_type":"EmptySD3LatentImage"},
        "75:7":{"inputs":{"text":"","clip":["75:38",0]},"class_type":"CLIPTextEncode"},
        "75:66":{"inputs":{"shift":3.1,"model":["75:73",0]},"class_type":"ModelSamplingAuraFlow"},
        "75:8":{"inputs":{"samples":["75:3",0],"vae":["75:39",0]},"class_type":"VAEDecode"},
        "75:37":{"inputs":{"unet_name":"qwen_image_fp8_e4m3fn.safetensors","weight_dtype":"default"},"class_type":"UNETLoader"},
        "75:6":{"inputs":{"text":"a photo of a cat","clip":["75:38",0]},"class_type":"CLIPTextEncode"},
        "75:73":{"inputs":{"lora_name":"Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors","strength_model":1,"model":["75:37",0]},"class_type":"LoraLoaderModelOnly"},
        "75:38":{"inputs":{"clip_name":"qwen_2.5_vl_7b_fp8_scaled.safetensors","type":"qwen_image","device":"default"},"class_type":"CLIPLoader"},
        "75:39":{"inputs":{"vae_name":"qwen_image_vae.safetensors"},"class_type":"VAELoader"},
        "75:3":{"inputs":{"seed":1125488487853216,"steps":5,"cfg":1,"sampler_name":"euler","scheduler":"simple","denoise":1,"model":["75:66",0],"positive":["75:6",0],"negative":["75:7",0],"latent_image":["75:58",0]},"class_type":"KSampler"}
    }
};


export interface ShotDetail {
  description: string;
  location: string;
  props: string[];
}

export interface GenerateMediumDetailedImagesInput {
  shotDetails: ShotDetail[];
}

export interface GenerateMediumDetailedImagesOutput {
  images: SketchImage[];
}

async function getImagesFromComfyUI(promptText: string): Promise<string> {
  const requestBody = JSON.parse(JSON.stringify(COMFYUI_WORKFLOW_TEMPLATE));

  // Update the positive prompt in the workflow
  if (requestBody.prompt && requestBody.prompt['75:6'] && requestBody.prompt['75:6'].inputs) {
    requestBody.prompt['75:6'].inputs.text = promptText;
  }

  // Set a random seed for variety
  if (requestBody.prompt && requestBody.prompt['75:3'] && requestBody.prompt['75:3'].inputs) {
    requestBody.prompt['75:3'].inputs.seed = Math.floor(Math.random() * 1e15);
  }

  console.log('Sending to ComfyUI for medium-detailed image:', JSON.stringify(requestBody, null, 2));

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
          // The SaveImage node ID is '60' in this workflow
          const outputs = historyJson[promptId].outputs;
          const saveImageNodeOutput = outputs['60'];

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

export async function generateMediumDetailedImages(
  input: GenerateMediumDetailedImagesInput
): Promise<GenerateMediumDetailedImagesOutput> {
  console.log('Generating medium-detailed images for shots via ComfyUI (Qwen):', input);

  const constructedPrompts = input.shotDetails.map(detail => {
    let prompt = `${detail.description}, in ${detail.location}`;
    if (detail.props.length > 0) {
      prompt += `, with props: ${detail.props.join(', ')}`;
    }
    return prompt;
  });

  const translatedPromises = constructedPrompts.map(desc => translateToEnglish(desc));
  const finalPrompts = await Promise.all(translatedPromises);
  
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
