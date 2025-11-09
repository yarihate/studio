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
  "client_id": "29b324cc02cd495d9ba30faa2fc20b0d",
  "prompt": {
    "4": {
      "inputs": {
        "ckpt_name": "sd_xl_base_1.0.safetensors"
      },
      "class_type": "CheckpointLoaderSimple",
      "_meta": {
        "title": "Load Checkpoint - BASE"
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
        "text": "sketch of young girl is sitting with her mobile phone answering the questions of the psychologist",
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
        "text": "text, watermark",
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
    "10": {
      "inputs": {
        "add_noise": "enable",
        "noise_seed": 343092596614948,
        "steps": 25,
        "cfg": 8,
        "sampler_name": "euler",
        "scheduler": "normal",
        "start_at_step": 0,
        "end_at_step": 20,
        "return_with_leftover_noise": "enable",
        "model": [
          "53",
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
      "class_type": "KSamplerAdvanced",
      "_meta": {
        "title": "KSampler (Advanced) - BASE"
      }
    },
    "11": {
      "inputs": {
        "add_noise": "disable",
        "noise_seed": 0,
        "steps": 25,
        "cfg": 8,
        "sampler_name": "euler",
        "scheduler": "normal",
        "start_at_step": 20,
        "end_at_step": 10000,
        "return_with_leftover_noise": "disable",
        "model": [
          "12",
          0
        ],
        "positive": [
          "15",
          0
        ],
        "negative": [
          "16",
          0
        ],
        "latent_image": [
          "10",
          0
        ]
      },
      "class_type": "KSamplerAdvanced",
      "_meta": {
        "title": "KSampler (Advanced) - REFINER"
      }
    },
    "12": {
      "inputs": {
        "ckpt_name": "sd_xl_refiner_1.0.safetensors"
      },
      "class_type": "CheckpointLoaderSimple",
      "_meta": {
        "title": "Load Checkpoint - REFINER"
      }
    },
    "15": {
      "inputs": {
        "text": "sketch of young girl is sitting with her mobile phone answering the questions of the psychologist",
        "clip": [
          "12",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "16": {
      "inputs": {
        "text": "text, watermark",
        "clip": [
          "12",
          1
        ]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "17": {
      "inputs": {
        "samples": [
          "11",
          0
        ],
        "vae": [
          "12",
          2
        ]
      },
      "class_type": "VAEDecode",
      "_meta": {
        "title": "VAE Decode"
      }
    },
    "19": {
      "inputs": {
        "filename_prefix": "ComfyUI",
        "images": [
          "17",
          0
        ]
      },
      "class_type": "SaveImage",
      "_meta": {
        "title": "Save Image"
      }
    },
    "53": {
      "inputs": {
        "lora_name": "Minute_Sketch_v2_R-16.safetensors",
        "strength_model": 1,
        "model": [
          "4",
          0
        ]
      },
      "class_type": "LoraLoaderModelOnly",
      "_meta": {
        "title": "LoraLoaderModelOnly"
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

    // Update the positive prompt in the workflow (both for base and refiner)
    if (requestBody.prompt && requestBody.prompt['6'] && requestBody.prompt['6'].inputs) {
        requestBody.prompt['6'].inputs.text = `sketch of ${promptText}`;
    }
    if (requestBody.prompt && requestBody.prompt['15'] && requestBody.prompt['15'].inputs) {
        requestBody.prompt['15'].inputs.text = `sketch of ${promptText}`;
    }

    // Set a random seed for variety in the KSamplerAdvanced node
    if (requestBody.prompt && requestBody.prompt['10'] && requestBody.prompt['10'].inputs) {
      requestBody.prompt['10'].inputs.noise_seed = Math.floor(Math.random() * 1e15);
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
                    // The output node for images is "19" (SaveImage) in the new workflow.
                    const saveImageNodeOutput = outputs['19'];
                    
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
      // The workflow now expects a "sketch of" prefix, which I am adding.
      return getImages(description);
  });

  const sketchDataUris = await Promise.all(sketchPromises);
  return { sketchDataUris };
}

// We need the translate function here to make the prompts English for the model
import { translateToEnglish } from './translate-to-english';
