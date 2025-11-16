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

const COMFYUI_URL = process.env.COMFYUI_URL || 'http://localhost:8000/prompt';
const COMFYUI_OUTPUT_URL = process.env.COMFYUI_OUTPUT_URL || 'http://localhost:8000/view';
const HISTORY_URL = (process.env.COMFYUI_URL || 'http://localhost:8000').replace('/prompt', '/history');

// This is the specific workflow for Detailed Wan 2.2-based image generation.
const COMFYUI_WORKFLOW_TEMPLATE = {
    "client_id":"088a66ccf953490db40dfef8add0c1b7",
    "prompt":{
        "2":{"inputs":{"samples":["91",0],"vae":["14",0]},"class_type":"VAEDecode"},
        "11":{"inputs":{"text":"色调艳丽，过曝，静态，细节模糊不清，字幕，风格，作品，画作，画面，静止，整体发灰，最差质量，低质量，JPEG压缩残留，丑陋的，残缺的，多余的手指，画得不好的手部，画得不好的脸部，畸形的，毁容的，形态畸形的肢体，手指融合，静止不动的画面，杂乱的背景，三条腿，背景人很多，倒着走\nbad anatomy, wrong anatomy, extra limb, floating limbs, bad hands, extra hands, bad eyes, missing arms, extra legs, fused fingers, too many fingers, ugly, deformed, extra digit, disconnected limbs, mutation, amputation","clip":["81",0]},"class_type":"CLIPTextEncode"},
        "14":{"inputs":{"vae_name":"wan_2.1_vae.safetensors"},"class_type":"VAELoader"},
        "23":{"inputs":{"text":"A young woman with short hair","clip":["81",0]},"class_type":"CLIPTextEncode"},
        "42":{"inputs":{"filename_prefix":"ComfyUI_HighlyDetailed","images":["2",0]},"class_type":"SaveImage"},
        "81":{"inputs":{"clip_name":"umt5xxl-encoder-q8_0.gguf","type":"wan"},"class_type":"CLIPLoaderGGUF"},
        "91":{"inputs":{"add_noise":"enable","noise_seed":1038410401608727,"steps":10,"cfg":1,"sampler_name":"euler","scheduler":"beta","start_at_step":3,"end_at_step":10,"return_with_leftover_noise":"disable","model":["128",0],"positive":["23",0],"negative":["11",0],"latent_image":["111",0]},"class_type":"KSamplerAdvanced"},
        "93":{"inputs":{"unet_name":"Wan2.2-T2V-A14B-LowNoise-Q8_0.gguf"},"class_type":"UnetLoaderGGUF"},
        "94":{"inputs":{"sage_attention":"auto","model":["93",0]},"class_type":"PathchSageAttentionKJ"},
        "111":{"inputs":{"add_noise":"enable","noise_seed":348253842978113,"steps":2,"cfg":1.5,"sampler_name":"euler","scheduler":"beta","start_at_step":0,"end_at_step":2,"return_with_leftover_noise":"disable","model":["94",0],"positive":["23",0],"negative":["11",0],"latent_image":["134",0]},"class_type":"KSamplerAdvanced"},
        "128":{"inputs":{"shift":1.0000000000000002,"model":["129",0]},"class_type":"ModelSamplingSD3"},
        "129":{"inputs":{"nag_scale":50.000000000000014,"nag_alpha":0.2700000000000001,"nag_tau":3.000000000000001,"input_type":"default","model":["132",0],"conditioning":["11",0]},"class_type":"WanVideoNAG"},
        "132":{"inputs":{"lora_name":"Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors","strength_model":1.0000000000000002,"model":["94",0]},"class_type":"LoraLoaderModelOnly"},
        "134":{"inputs":{"width":1024,"height":1024,"length":1,"batch_size":1},"class_type":"EmptyHunyuanLatentVideo"}
    }
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

const STYLE_SNIPPETS: Record<NonNullable<ImageStyle>, string> = {
  'Hyper-Realistic Natural': 'hyper-realistic portrait photography, natural lighting, high dynamic range, lifelike skin texture, detailed eyes and hair, minimal color grading, soft shadows, shallow depth of field, shot on high-end mirrorless camera',
  'Editorial / Fashion Cinematic': 'fashion editorial photography, cinematic soft lighting, glossy highlights, refined color palette, subtle professional retouching, high-end wardrobe styling, medium-format camera depth and clarity',
  'Filmic / 35mm Aesthetic': 'cinematic 35mm film aesthetic, soft ambient lighting, subtle film grain, warm tones, analog texture',
};

async function getImagesFromComfyUI(promptText: string): Promise<string> {
  const requestBody = JSON.parse(JSON.stringify(COMFYUI_WORKFLOW_TEMPLATE));

  // Update the positive prompt in the workflow (node "23")
  if (requestBody.prompt && requestBody.prompt['23'] && requestBody.prompt['23'].inputs) {
    requestBody.prompt['23'].inputs.text = promptText;
  }

  // Set random seeds for variety
  if (requestBody.prompt && requestBody.prompt['91'] && requestBody.prompt['91'].inputs) {
    requestBody.prompt['91'].inputs.noise_seed = Math.floor(Math.random() * 1e15);
  }
  if (requestBody.prompt && requestBody.prompt['111'] && requestBody.prompt['111'].inputs) {
    requestBody.prompt['111'].inputs.noise_seed = Math.floor(Math.random() * 1e15);
  }

  console.log('Sending to ComfyUI for detailed image (Wan 2.2):', JSON.stringify(requestBody, null, 2));

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
        const historyResponse = await fetch(`${HISTORY_URL}/${promptId}`, { method: 'GET' });
        if (!historyResponse.ok) {
          if (historyResponse.status === 404) {
            setTimeout(checkStatus, 2000);
            return;
          }
          reject(new Error(`Failed to get history for prompt ${promptId}. Status: ${historyResponse.status}`));
          return;
        }

        const historyJson = await historyResponse.json();
        if (historyJson[promptId] && historyJson[promptId].outputs) {
          const outputs = historyJson[promptId].outputs;
          const saveImageNodeOutput = outputs['42']; // Node ID for "Save Image"

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
  console.log('Generating detailed images for shots via ComfyUI (Wan 2.2):', input);

  const constructedPrompts = input.shotDetails.map(detail => {
    let basePrompt = `${detail.description}, in ${detail.location}`;
    if (detail.props.length > 0) {
      basePrompt += `, with props: ${detail.props.join(', ')}`;
    }
    return basePrompt;
  });

  const translatedPromises = constructedPrompts.map(desc => translateToEnglish(desc));
  const translatedBasePrompts = await Promise.all(translatedPromises);
  
  const finalPrompts = translatedBasePrompts.map(basePrompt => {
      if(input.style && STYLE_SNIPPETS[input.style]) {
          return `${basePrompt}, ${STYLE_SNIPPETS[input.style]}`;
      }
      return basePrompt;
  });
  
  const imagePromises = finalPrompts.map(async (prompt, index) => {
    const imageUrl = await getImagesFromComfyUI(prompt);
    return {
      imageUrl,
      prompt: constructedPrompts[index],
    };
  });

  