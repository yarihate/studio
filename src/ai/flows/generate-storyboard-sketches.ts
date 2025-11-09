'use server';
/**
 * @fileOverview Generates storyboard sketches for scenes by calling a local ComfyUI instance.
 *
 * - generateStoryboardSketches - A function that generates storyboard sketches for given shot descriptions.
 * - GenerateStoryboardSketchesInput - The input type for the generateStoryboardSketches function.
 * - GenerateStoryboardSketchesOutput - The return type for the generateStoryboardSketches function.
 */

const COMFYUI_URL = 'http://localhost:8000/prompt';
const COMFYUI_OUTPUT_URL = 'http://localhost:8000/view';

// The ComfyUI workflow template provided by the user.
const COMFYUI_WORKFLOW_TEMPLATE = {
  "client_id": "ca00322480d246d7bc283868962bc856",
  "prompt": {
    "1": {
      "inputs": {
        "nag_scale": 11,
        "nag_alpha": 0.25,
        "nag_tau": 2.5,
        "input_type": "default",
        "model": [
          "53",
          0
        ],
        "conditioning": [
          "11",
          0
        ]
      },
      "class_type": "WanVideoNAG",
      "_meta": {
        "title": "WanVideoNAG"
      }
    },
    "2": {
      "inputs": {
        "samples": [
          "13",
          0
        ],
        "vae": [
          "14",
          0
        ]
      },
      "class_type": "VAEDecode",
      "_meta": {
        "title": "VAE Decode"
      }
    },
    "4": {
      "inputs": {
        "anything": [
          "2",
          0
        ]
      },
      "class_type": "easy cleanGpuUsed",
      "_meta": {
        "title": "Clean VRAM Used"
      }
    },
    "8": {
      "inputs": {
        "sage_attention": "disabled",
        "model": [
          "54",
          0
        ]
      },
      "class_type": "PathchSageAttentionKJ",
      "_meta": {
        "title": "Patch Sage Attention KJ"
      }
    },
    "9": {
      "inputs": {
        "enable_fp16_accumulation": false,
        "model": [
          "8",
          0
        ]
      },
      "class_type": "ModelPatchTorchSettings",
      "_meta": {
        "title": "Model Patch Torch Settings"
      }
    },
    "11": {
      "inputs": {
        "text": "poorly drawn, bad anatomy, bad hands, bad eyes, missing fingers, extra fingers, ugly, deformed, disfigured, blurry, grainy, out of focus, low resolution, amateur, poorly lit, oversaturated, undersaturated, watermark, signature, text, writing, noise, artifacts",
        "clip": [
          "53",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Negative Prompt)"
      }
    },
    "12": {
      "inputs": {
        "width": 720,
        "height": 1280,
        "length": 1,
        "batch_size": 2
      },
      "class_type": "EmptyHunyuanLatentVideo",
      "_meta": {
        "title": "EmptyHunyuanLatentVideo"
      }
    },
    "13": {
      "inputs": {
        "seed": 279204935445648,
        "steps": 60,
        "cfg": 1,
        "sampler_name": "euler",
        "scheduler": "beta",
        "denoise": 1,
        "model": [
          "20",
          0
        ],
        "positive": [
          "23",
          0
        ],
        "negative": [
          "11",
          0
        ],
        "latent_image": [
          "12",
          0
        ]
      },
      "class_type": "KSampler",
      "_meta": {
        "title": "KSampler"
      }
    },
    "14": {
      "inputs": {
        "vae_name": "wan_2.1_vae.safetensors"
      },
      "class_type": "VAELoader",
      "_meta": {
        "title": "Load VAE"
      }
    },
    "15": {
      "inputs": {
        "filename_prefix": "ComfyUI",
        "images": [
          "29",
          0
        ]
      },
      "class_type": "SaveImage",
      "_meta": {
        "title": "Save Image"
      }
    },
    "17": {
      "inputs": {
        "unet_name": "Wan2.2-T2V-A14B-LowNoise-Q6_K.gguf"
      },
      "class_type": "UnetLoaderGGUF",
      "_meta": {
        "title": "Unet Loader (GGUF)"
      }
    },
    "18": {
      "inputs": {
        "clip_name": "umt5xxl-encoder-q8_0.gguf",
        "type": "wan"
      },
      "class_type": "CLIPLoaderGGUF",
      "_meta": {
        "title": "CLIPLoader (GGUF)"
      }
    },
    "20": {
      "inputs": {
        "shift": 1.0000000000000002,
        "model": [
          "1",
          0
        ]
      },
      "class_type": "ModelSamplingSD3",
      "_meta": {
        "title": "Shift"
      }
    },
    "23": {
      "inputs": {
        "text": "girl sitting on the sofa",
        "clip": [
          "53",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Positive Prompt)"
      }
    },
    "29": {
      "inputs": {
        "anything": [
          "4",
          0
        ]
      },
      "class_type": "easy clearCacheAll",
      "_meta": {
        "title": "Clear Cache All"
      }
    },
    "53": {
      "inputs": {
        "PowerLoraLoaderHeaderWidget": {
          "type": "PowerLoraLoaderHeaderWidget"
        },
        "lora_1": {
          "on": true,
          "lora": "Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors",
          "strength": 0.8
        },
        "lora_2": {
          "on": false,
          "lora": "AlvaLarsson2211_low_5.safetensors",
          "strength": 1
        },
        "lora_3": {
          "on": true,
          "lora": "Instagirlv2.5-LOW.safetensors",
          "strength": 0.8
        },
        "lora_4": {
          "on": false,
          "lora": "Lenovo.safetensors",
          "strength": 1
        },
        "lora_5": {
          "on": false,
          "lora": "Ol1v14_000001000_low_noise.safetensors",
          "strength": 1
        },
        "lora_6": {
          "on": true,
          "lora": "Ol1v14_low_noise.safetensors",
          "strength": 1
        },
        "➕ Add Lora": "",
        "model": [
          "9",
          0
        ],
        "clip": [
          "55",
          0
        ]
      },
      "class_type": "Power Lora Loader (rgthree)",
      "_meta": {
        "title": "Power Lora Loader (rgthree)"
      }
    },
    "54": {
      "inputs": {
        "unet_name": "Wan2.2\\wan2.2_t2v_low_noise_14B_fp16.safetensors",
        "weight_dtype": "default"
      },
      "class_type": "UNETLoader",
      "_meta": {
        "title": "Load Diffusion Model"
      }
    },
    "55": {
      "inputs": {
        "clip_name": "umt5_xxl_fp16.safetensors",
        "type": "wan",
        "device": "default"
      },
      "class_type": "CLIPLoader",
      "_meta": {
        "title": "Load CLIP"
      }
    }
  },
  "extra_data": {
    "extra_pnginfo": {
      "workflow": {
        "id": "fdb47d40-0ef5-4eaf-bc33-7c21fcf83172",
        "revision": 0,
        "last_node_id": 55,
        "last_link_id": 63,
        "nodes": [],
        "links": [],
        "groups": [],
        "config": {},
        "extra": {},
        "version": 0.4
      }
    }
  }
};
export interface GenerateStoryboardSketchesInput {
  shotDescriptions: string[];
}

export interface GenerateStoryboardSketchesOutput {
  sketchDataUris: string[];
}


async function getImages(promptText: string): Promise<string> {
    const requestBody = JSON.parse(JSON.stringify(COMFYUI_WORKFLOW_TEMPLATE));

    // Update the positive prompt in the workflow
    // Node "23" is the "CLIP Text Encode (Positive Prompt)"
    if (requestBody.prompt && requestBody.prompt['23'] && requestBody.prompt['23'].inputs) {
        requestBody.prompt['23'].inputs.text = promptText;
    }

    // Set a random seed for variety
    if (requestBody.prompt && requestBody.prompt['13'] && requestBody.prompt['13'].inputs) {
      requestBody.prompt['13'].inputs.seed = Math.floor(Math.random() * 1e15);
    }
    
    const response = await fetch(COMFYUI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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

    // Await the image generation by polling the history
    return new Promise((resolve, reject) => {
        const checkStatus = async () => {
            try {
                const historyResponse = await fetch(`http://localhost:8000/history/${promptId}`);
                if (!historyResponse.ok) {
                    // If history is not yet available, wait and retry
                    if (historyResponse.status === 404) {
                        setTimeout(checkStatus, 2000); // Check every 2 seconds
                        return;
                    }
                    reject(new Error(`Failed to get history for prompt ${promptId}. Status: ${historyResponse.status}`));
                    return;
                }

                const historyJson = await historyResponse.json();
                if (historyJson[promptId] && historyJson[promptId].outputs) {
                    const outputs = historyJson[promptId].outputs;
                    // The output node for images is "15" (SaveImage) in the new workflow.
                    const saveImageNodeOutput = outputs['15'];
                    
                    if (saveImageNodeOutput && saveImageNodeOutput.images && saveImageNodeOutput.images.length > 0) {
                        const imageData = saveImageNodeOutput.images[0];
                        // Construct the full URL to view the image
                        const imageUrl = `${COMFYUI_OUTPUT_URL}?filename=${imageData.filename}&subfolder=${imageData.subfolder}&type=${imageData.type}`;
                        
                        // To return a data URI, we need to fetch the image content
                        const imageResponse = await fetch(imageUrl);
                        if (!imageResponse.ok) {
                           reject(new Error(`Failed to fetch generated image from ${imageUrl}`));
                           return;
                        }
                        const imageBuffer = await imageResponse.arrayBuffer();
                        const imageBase64 = Buffer.from(imageBuffer).toString('base64');
                        const mimeType = imageResponse.headers.get('content-type') || 'image/png';
                        const dataUri = `data:${mimeType};base64,${imageBase64}`;

                        resolve(dataUri);

                    } else {
                        // still processing, check again
                        setTimeout(checkStatus, 2000);
                    }
                } else {
                     // still processing, check again
                    setTimeout(checkStatus, 2000);
                }
            } catch (error) {
                console.error("Error while checking ComfyUI history:", error);
                // Keep retrying on network errors etc.
                setTimeout(checkStatus, 3000);
            }
        };
        checkStatus();
    });
}


export async function generateStoryboardSketches(
  input: GenerateStoryboardSketchesInput
): Promise<GenerateStoryboardSketchesOutput> {
  console.log('Generating storyboard sketches for shots via ComfyUI:', input.shotDescriptions);
  
  // Translate all descriptions to English first, as the model likely performs better.
  const translatedPromises = input.shotDescriptions.map((desc) => translateToEnglish(desc));
  const translatedDescriptions = await Promise.all(translatedPromises);

  const sketchPromises = translatedDescriptions.map((description) => {
      // The new workflow doesn't need a "sketch of" prefix.
      return getImages(description);
  });

  const sketchDataUris = await Promise.all(sketchPromises);
  return { sketchDataUris };
}

// We need the translate function here to make the prompts English for the model
import { translateToEnglish } from './translate-to-english';

    