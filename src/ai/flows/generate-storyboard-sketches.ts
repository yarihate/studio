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
    "id":"88bcf757-1298-432f-885a-db5ab88cf224","revision":0,"last_node_id":53,"last_link_id":50,"nodes":[{"id":5,"type":"EmptyLatentImage","pos":[-95.59717559814453,-571.0374755859375],"size":[300,110],"flags":{},"order":0,"mode":0,"inputs":[{"localized_name":"width","name":"width","type":"INT","widget":{"name":"width"},"link":null},{"localized_name":"height","name":"height","type":"INT","widget":{"name":"height"},"link":null},{"localized_name":"batch_size","name":"batch_size","type":"INT","widget":{"name":"batch_size"},"link":null}],"outputs":[{"localized_name":"LATENT","name":"LATENT","type":"LATENT","slot_index":0,"links":[27]}],"properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"EmptyLatentImage","widget_ue_connectable":{}},"widgets_values":[1024,1024,1],"color":"#323","bgcolor":"#535"},{"id":45,"type":"PrimitiveNode","pos":[295.5135192871094,-570.4500122070312],"size":[210,82],"flags":{},"order":1,"mode":0,"inputs":[],"outputs":[{"name":"INT","type":"INT","widget":{"name":"steps"},"links":[38,41]}],"title":"steps","properties":{"Run widget replace on values":false,"widget_ue_connectable":{}},"widgets_values":[25,"fixed"],"color":"#432","bgcolor":"#653"},{"id":47,"type":"PrimitiveNode","pos":[296.2197570800781,-439.43743896484375],"size":[210,82],"flags":{},"order":2,"mode":0,"inputs":[],"outputs":[{"name":"INT","type":"INT","widget":{"name":"end_at_step"},"slot_index":0,"links":[43,44]}],"title":"end_at_step","properties":{"Run widget replace on values":false,"widget_ue_connectable":{}},"widgets_values":[20,"fixed"],"color":"#432","bgcolor":"#653"},{"id":17,"type":"VAEDecode","pos":[1197.0247802734375,599.3170166015625],"size":[200,50],"flags":{},"order":14,"mode":0,"inputs":[{"localized_name":"samples","name":"samples","type":"LATENT","link":25},{"localized_name":"vae","name":"vae","type":"VAE","link":34}],"outputs":[{"localized_name":"IMAGE","name":"IMAGE","type":"IMAGE","slot_index":0,"links":[28]}],"properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"VAEDecode","widget_ue_connectable":{}},"widgets_values":[],"color":"#332922","bgcolor":"#593930"},{"id":6,"type":"CLIPTextEncode","pos":[301.707763671875,-48.872215270996094],"size":[405.0923156738281,124.19273376464844],"flags":{},"order":10,"mode":0,"inputs":[{"localized_name":"clip","name":"clip","type":"CLIP","link":3},{"localized_name":"text","name":"text","type":"STRING","widget":{"name":"text"},"link":45}],"outputs":[{"localized_name":"CONDITIONING","name":"CONDITIONING","type":"CONDITIONING","slot_index":0,"links":[11]}],"properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"CLIPTextEncode","widget_ue_connectable":{"text":true}},"widgets_values":["sketch of young girl is sitting with her mobile phone answering the questions of the psychologist"],"color":"#232","bgcolor":"#353"},{"id":10,"type":"KSamplerAdvanced","pos":[808.7730102539062,-57.895355224609375],"size":[300,334],"flags":{},"order":12,"mode":0,"inputs":[{"localized_name":"model","name":"model","type":"MODEL","link":50},{"localized_name":"positive","name":"positive","type":"CONDITIONING","link":11},{"localized_name":"negative","name":"negative","type":"CONDITIONING","link":12},{"localized_name":"latent_image","name":"latent_image","type":"LATENT","link":27},{"localized_name":"add_noise","name":"add_noise","type":"COMBO","widget":{"name":"add_noise"},"link":null},{"localized_name":"noise_seed","name":"noise_seed","type":"INT","widget":{"name":"noise_seed"},"link":null},{"localized_name":"steps","name":"steps","type":"INT","widget":{"name":"steps"},"link":41},{"localized_name":"cfg","name":"cfg","type":"FLOAT","widget":{"name":"cfg"},"link":null},{"localized_name":"sampler_name","name":"sampler_name","type":"COMBO","widget":{"name":"sampler_name"},"link":null},{"localized_name":"scheduler","name":"scheduler","type":"COMBO","widget":{"name":"scheduler"},"link":null},{"localized_name":"start_at_step","name":"start_at_step","type":"INT","widget":{"name":"start_at_step"},"link":null},{"localized_name":"end_at_step","name":"end_at_step","type":"INT","widget":{"name":"end_at_step"},"link":43},{"localized_name":"return_with_leftover_noise","name":"return_with_leftover_noise","type":"COMBO","widget":{"name":"return_with_leftover_noise"},"link":null}],"outputs":[{"localized_name":"LATENT","name":"LATENT","type":"LATENT","slot_index":0,"links":[13]}],"title":"KSampler (Advanced) - BASE","properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"KSamplerAdvanced","widget_ue_connectable":{"steps":true,"end_at_step":true}},"widgets_values":["enable",343092596614948,"randomize",25,8,"euler","normal",0,20,"enable"]},{"id":15,"type":"CLIPTextEncode","pos":[316.0187072753906,637.33154296875],"size":[391.591552734375,148.68138122558594],"flags":{},"order":11,"mode":0,"inputs":[{"localized_name":"clip","name":"clip","type":"CLIP","link":19},{"localized_name":"text","name":"text","type":"STRING","widget":{"name":"text"},"link":47}],"outputs":[{"localized_name":"CONDITIONING","name":"CONDITIONING","type":"CONDITIONING","slot_index":0,"links":[23]}],"properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"CLIPTextEncode","widget_ue_connectable":{"text":true}},"widgets_values":["sketch of young girl is sitting with her mobile phone answering the questions of the psychologist"],"color":"#232","bgcolor":"#353"},{"id":16,"type":"CLIPTextEncode","pos":[315.9026794433594,837.3108520507812],"size":[388.5469970703125,121.34178161621094],"flags":{},"order":7,"mode":0,"inputs":[{"localized_name":"clip","name":"clip","type":"CLIP","link":20},{"localized_name":"text","name":"text","type":"STRING","widget":{"name":"text"},"link":48}],"outputs":[{"localized_name":"CONDITIONING","name":"CONDITIONING","type":"CONDITIONING","slot_index":0,"links":[24]}],"properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"CLIPTextEncode","widget_ue_connectable":{"text":true}},"widgets_values":["text, watermark"],"color":"#322","bgcolor":"#533"},{"id":11,"type":"KSamplerAdvanced","pos":[819.1201782226562,608.375],"size":[300,340],"flags":{},"order":13,"mode":0,"inputs":[{"localized_name":"model","name":"model","type":"MODEL","link":14},{"localized_name":"positive","name":"positive","type":"CONDITIONING","link":23},{"localized_name":"negative","name":"negative","type":"CONDITIONING","link":24},{"localized_name":"latent_image","name":"latent_image","type":"LATENT","link":13},{"localized_name":"add_noise","name":"add_noise","type":"COMBO","widget":{"name":"add_noise"},"link":null},{"localized_name":"noise_seed","name":"noise_seed","type":"INT","widget":{"name":"noise_seed"},"link":null},{"localized_name":"steps","name":"steps","type":"INT","widget":{"name":"steps"},"link":38},{"localized_name":"cfg","name":"cfg","type":"FLOAT","widget":{"name":"cfg"},"link":null},{"localized_name":"sampler_name","name":"sampler_name","type":"COMBO","widget":{"name":"sampler_name"},"link":null},{"localized_name":"scheduler","name":"scheduler","type":"COMBO","widget":{"name":"scheduler"},"link":null},{"localized_name":"start_at_step","name":"start_at_step","type":"INT","widget":{"name":"start_at_step"},"link":44},{"localized_name":"end_at_step","name":"end_at_step","type":"INT","widget":{"name":"end_at_step"},"link":null},{"localized_name":"return_with_leftover_noise","name":"return_with_leftover_noise","type":"COMBO","widget":{"name":"return_with_leftover_noise"},"link":null}],"outputs":[{"localized_name":"LATENT","name":"LATENT","type":"LATENT","slot_index":0,"links":[25]}],"title":"KSampler (Advanced) - REFINER","properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"KSamplerAdvanced","widget_ue_connectable":{"steps":true,"start_at_step":true}},"widgets_values":["disable",0,"fixed",25,8,"euler","normal",20,10000,"disable"]},{"id":12,"type":"CheckpointLoaderSimple","pos":[-80.37397003173828,658.974609375],"size":[325.4814453125,99.73925018310547],"flags":{},"order":3,"mode":0,"inputs":[{"localized_name":"ckpt_name","name":"ckpt_name","type":"COMBO","widget":{"name":"ckpt_name"},"link":null}],"outputs":[{"localized_name":"MODEL","name":"MODEL","type":"MODEL","slot_index":0,"links":[14]},{"localized_name":"CLIP","name":"CLIP","type":"CLIP","slot_index":1,"links":[19,20]},{"localized_name":"VAE","name":"VAE","type":"VAE","slot_index":2,"links":[34]}],"title":"Load Checkpoint - REFINER","properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"CheckpointLoaderSimple","models":[{"name":"sd_xl_refiner_1.0.safetensors","url":"https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors?download=true","directory":"checkpoints"}],"widget_ue_connectable":{}},"widgets_values":["sd_xl_refiner_1.0.safetensors"],"color":"#323","bgcolor":"#535"},{"id":50,"type":"PrimitiveNode","pos":[-458.9957580566406,123.28369903564453],"size":[300,160],"flags":{},"order":4,"mode":0,"inputs":[],"outputs":[{"name":"STRING","type":"STRING","widget":{"name":"text"},"slot_index":0,"links":[46,48]}],"title":"Negative Prompt (Text)","properties":{"Run widget replace on values":false,"widget_ue_connectable":{}},"widgets_values":["text, watermark"],"color":"#322","bgcolor":"#533"},{"id":19,"type":"SaveImage","pos":[1558.4725341796875,553.4407958984375],"size":[565.77001953125,596.3800048828125],"flags":{},"order":15,"mode":0,"inputs":[{"localized_name":"images","name":"images","type":"IMAGE","link":28},{"localized_name":"filename_prefix","name":"filename_prefix","type":"STRING","widget":{"name":"filename_prefix"},"link":null}],"outputs":[],"properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"SaveImage","widget_ue_connectable":{}},"widgets_values":["ComfyUI"]},{"id":4,"type":"CheckpointLoaderSimple","pos":[-90,-50],"size":[350,100],"flags":{},"order":5,"mode":0,"inputs":[{"localized_name":"ckpt_name","name":"ckpt_name","type":"COMBO","widget":{"name":"ckpt_name"},"link":null}],"outputs":[{"localized_name":"MODEL","name":"MODEL","type":"MODEL","slot_index":0,"links":[49]},{"localized_name":"CLIP","name":"CLIP","type":"CLIP","slot_index":1,"links":[3,5]},{"localized_name":"VAE","name":"VAE","type":"VAE","slot_index":2,"links":[]}],"title":"Load Checkpoint - BASE","properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"CheckpointLoaderSimple","models":[{"name":"sd_xl_base_1.0.safetensors","url":"https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors?download=true","directory":"checkpoints"}],"widget_ue_connectable":{}},"widgets_values":["sd_xl_base_1.0.safetensors"],"color":"#323","bgcolor":"#535"},{"id":51,"type":"PrimitiveNode","pos":[-458.9957580566406,-76.71602630615234],"size":[300,160],"flags":{},"order":6,"mode":0,"inputs":[],"outputs":[{"name":"STRING","type":"STRING","widget":{"name":"text"},"slot_index":0,"links":[45,47]}],"title":"Positive Prompt (Text)","properties":{"Run widget replace on values":false,"widget_ue_connectable":{}},"widgets_values":["sketch of young girl is sitting with her mobile phone answering the questions of the psychologist"],"color":"#232","bgcolor":"#353"},{"id":7,"type":"CLIPTextEncode","pos":[311.707763671875,121.12776947021484],"size":[397.553466796875,142.57814025878906],"flags":{},"order":9,"mode":0,"inputs":[{"localized_name":"clip","name":"clip","type":"CLIP","link":5},{"localized_name":"text","name":"text","type":"STRING","widget":{"name":"text"},"link":46}],"outputs":[{"localized_name":"CONDITIONING","name":"CONDITIONING","type":"CONDITIONING","slot_index":0,"links":[12]}],"properties":{"cnr_id":"comfy-core","ver":"0.3.33","Node name for S&R":"CLIPTextEncode","widget_ue_connectable":{"text":true}},"widgets_values":["text, watermark"],"color":"#322","bgcolor":"#533"},{"id":53,"type":"LoraLoaderModelOnly","pos":[688.4058087709487,-282.7745809460024],"size":[270,82],"flags":{},"order":8,"mode":0,"inputs":[{"localized_name":"model","name":"model","type":"MODEL","link":49},{"localized_name":"lora_name","name":"lora_name","type":"COMBO","widget":{"name":"lora_name"},"link":null},{"localized_name":"strength_model","name":"strength_model","type":"FLOAT","widget":{"name":"strength_model"},"link":null}],"outputs":[{"localized_name":"MODEL","name":"MODEL","type":"MODEL","links":[50]}],"properties":{"cnr_id":"comfy-core","ver":"0.3.67","Node name for S&R":"LoraLoaderModelOnly","widget_ue_connectable":{}},"widgets_values":["Minute_Sketch_v2_R-16.safetensors",1]}],"links":[[3,4,1,6,0,"CLIP"],[5,4,1,7,0,"CLIP"],[11,6,0,10,1,"CONDITIONING"],[12,7,0,10,2,"CONDITIONING"],[13,10,0,11,3,"LATENT"],[14,12,0,11,0,"MODEL"],[19,12,1,15,0,"CLIP"],[20,12,1,16,0,"CLIP"],[23,15,0,11,1,"CONDITIONING"],[24,16,0,11,2,"CONDITIONING"],[25,11,0,17,0,"LATENT"],[27,5,0,10,3,"LATENT"],[28,17,0,19,0,"IMAGE"],[34,12,2,17,1,"VAE"],[38,45,0,11,6,"INT"],[41,45,0,10,6,"INT"],[43,47,0,10,11,"INT"],[44,47,0,11,10,"INT"],[45,51,0,6,1,"STRING"],[46,50,0,7,1,"STRING"],[47,51,0,15,1,"STRING"],[48,50,0,16,1,"STRING"],[49,4,0,53,0,"MODEL"],[50,53,0,10,0,"MODEL"]],"groups":[{"id":1,"title":"Base Prompt","bounding":[281.707763671875,-128.8721160888672,439.7534484863281,600.5301513671875],"color":"#3f789e","font_size":24,"flags":{}},{"id":2,"title":"Refiner Prompt","bounding":[285.9026794433594,567.3108520507812,442.127685546875,588.2311401367188],"color":"#3f789e","font_size":24,"flags":{}},{"id":4,"title":"Load in BASE SDXL Model","bounding":[-100,-130,359.4917907714844,403.9964904785156],"color":"#a1309b","font_size":24,"flags":{}},{"id":5,"title":"Load in REFINER SDXL Model","bounding":[-95.2878189086914,564.1364135742188,361.54791259765625,403.3152160644531],"color":"#a1309b","font_size":24,"flags":{}},{"id":6,"title":"Empty Latent Image","bounding":[-115.09705352783203,-652.1575317382812,353.29144287109375,461.8235168457031],"color":"#a1309b","font_size":24,"flags":{}},{"id":7,"title":"VAE Decoder","bounding":[1165.2672119140625,521.2222900390625,358.535400390625,332.57080078125],"color":"#b06634","font_size":24,"flags":{}},{"id":8,"title":"Step Control","bounding":[266.23602294921875,-652.185302734375,274.54791259765625,472.66363525390625],"color":"#3f789e","font_size":24,"flags":{}},{"id":10,"title":"Text Prompts","bounding":[-471.7359313964844,-166.89599609375,339,622],"color":"#3f789e","font_size":24,"flags":{}},{"id":11,"title":"Base","bounding":[-110,-173.60000610351562,1228.77294921875,655.2579956054688],"color":"#3f789e","font_size":24,"flags":{}},{"id":12,"title":"Refiner","bounding":[-105.2878189086914,520.5363159179688,1234.4083251953125,645.005615234375],"color":"#3f789e","font_size":24,"flags":{}}],"config":{},"extra":{"ds":{"scale":0.6588450000000062,"offset":[719.6683671965432,165.8740300949878]},"frontendVersion":"1.18.9","ue_links":[],"links_added_by_ue":[]},"version":0.4
  };

export interface GenerateStoryboardSketchesInput {
  shotDescriptions: string[];
}

export interface GenerateStoryboardSketchesOutput {
  sketchDataUris: string[];
}


async function getImages(prompt: string): Promise<string> {
    const workflow = JSON.parse(JSON.stringify(COMFYUI_WORKFLOW_TEMPLATE));

    // Find the positive prompt nodes and update their values
    // Node 51: Main positive prompt input
    const positivePromptNode = workflow.nodes.find((node: any) => node.id === 51);
    if (positivePromptNode) {
        positivePromptNode.widgets_values = [prompt];
    }
     // Node 6: First CLIPTextEncode using the positive prompt
    const node6 = workflow.nodes.find((node: any) => node.id === 6);
    if (node6) {
        node6.widgets_values = [prompt];
    }
    // Node 15: Second CLIPTextEncode using the positive prompt
    const node15 = workflow.nodes.find((node: any) => node.id === 15);
    if (node15) {
        node15.widgets_values = [prompt];
    }

    const response = await fetch(COMFYUI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: workflow }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('ComfyUI request failed:', errorBody);
        throw new Error(`ComfyUI API request failed with status ${response.status}: ${errorBody}`);
    }

    const jsonResponse = await response.json();
    const promptId = jsonResponse.prompt_id;

    // Await the image generation by polling the history
    return new Promise((resolve, reject) => {
        const checkStatus = async () => {
            try {
                const historyResponse = await fetch(`http://localhost:8000/history/${promptId}`);
                if (!historyResponse.ok) {
                    // If history is not yet available, wait and retry
                    if (historyResponse.status === 404) {
                        setTimeout(checkStatus, 1000);
                        return;
                    }
                    reject(new Error(`Failed to get history for prompt ${promptId}. Status: ${historyResponse.status}`));
                    return;
                }

                const historyJson = await historyResponse.json();
                if (historyJson[promptId] && historyJson[promptId].outputs) {
                    const outputs = historyJson[promptId].outputs;
                    // Find the output from the "SaveImage" node (ID 19 in the workflow)
                    const saveImageNodeOutput = outputs['19'];
                    
                    if (saveImageNodeOutput && saveImageNodeOutput.images) {
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
                        setTimeout(checkStatus, 1000);
                    }
                } else {
                     // still processing, check again
                    setTimeout(checkStatus, 1000);
                }
            } catch (error) {
                console.error("Error while checking ComfyUI history:", error);
                // Keep retrying on network errors etc.
                setTimeout(checkStatus, 2000);
            }
        };
        checkStatus();
    });
}


export async function generateStoryboardSketches(
  input: GenerateStoryboardSketchesInput
): Promise<GenerateStoryboardSketchesOutput> {
  console.log('Generating storyboard sketches for shots via ComfyUI:', input.shotDescriptions);
  
  const sketchPromises = input.shotDescriptions.map((description) => {
      // Add a prefix to guide the model, as seen in the template
      const prompt = `sketch of ${description.toLowerCase()}`;
      return getImages(prompt);
  });

  const sketchDataUris = await Promise.all(sketchPromises);
  return { sketchDataUris };
}
