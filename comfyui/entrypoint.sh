#!/bin/sh
set -e

# Function to download a file if it doesn't exist
download_if_not_exists() {
  FILE_PATH=$1
  URL=$2
  if [ ! -f "$FILE_PATH" ]; then
    echo "Downloading $FILE_PATH..."
    wget -q -O "$FILE_PATH" "$URL"
  else
    echo "$FILE_PATH already exists, skipping download."
  fi
}

# Create directories if they don't exist
mkdir -p /app/models/checkpoints
mkdir -p /app/models/loras
mkdir -p /app/models/unet
mkdir -p /app/models/text_encoders
mkdir -p /app/models/vae

# Download models
download_if_not_exists "/app/models/checkpoints/sd_xl_base_1.0.safetensors" "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors"
download_if_not_exists "/app/models/checkpoints/sd_xl_refiner_1.0.safetensors" "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_refiner_1.0.safetensors"
download_if_not_exists "/app/models/loras/Minute_Sketch_v2_R-16.safetensors" "https://civitai.com/api/download/models/293240?token=${HF_TOKEN}"
download_if_not_exists "/app/models/unet/qwen_image_fp8_e4m3fn.safetensors" "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/diffusion_models/qwen_image_fp8_e4m3fn.safetensors"
download_if_not_exists "/app/models/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors" "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors"
download_if_not_exists "/app/models/loras/Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors" "https://huggingface.co/lightx2v/Qwen-Image-Lightning/resolve/main/Qwen-Image-Edit-2509/Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors?download=true"
download_if_not_exists "/app/models/vae/qwen_image_vae.safetensors" "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors"
download_if_not_exists "/app/models/text_encoders/umt5xxl-encoder-q8_0.gguf" "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5xxl-encoder-q8_0.gguf?download=true"
download_if_not_exists "/app/models/unet/Wan2.2-T2V-A14B-LowNoise-Q8_0.gguf" "https://huggingface.co/kj-nodes/Wan-Video-2.2/resolve/main/Wan2.2-T2V-A14B-LowNoise-Q8_0.gguf?download=true"
download_if_not_exists "/app/models/vae/wan_2.1_vae.safetensors" "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors?download=true"
download_if_not_exists "/app/models/loras/Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors" "https://huggingface.co/kj-nodes/Wan-Video-2.1-Samples-and-workflows/resolve/main/Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors?download=true"


# Start ComfyUI
echo "Starting ComfyUI..."
python3 main.py --listen --port 8000
