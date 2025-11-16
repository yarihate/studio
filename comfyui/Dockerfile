# Use the official NVIDIA CUDA image as the base
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install wget, git, and python
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    git \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Clone the ComfyUI repository
RUN git clone https://github.com/comfyanonymous/ComfyUI.git .

# Install dependencies using the requirements.txt from the cloned repo
RUN pip install --no-cache-dir -r requirements.txt

# Create directories for models
RUN mkdir -p /app/models/checkpoints \
             /app/models/loras \
             /app/models/unet \
             /app/models/text_encoders \
             /app/models/vae

# Download models
RUN wget -q -O /app/models/checkpoints/sd_xl_base_1.0.safetensors "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors" && \
    wget -q -O /app/models/checkpoints/sd_xl_refiner_1.0.safetensors "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_refiner_1.0.safetensors" && \
    wget -q -O /app/models/loras/Minute_Sketch_v2_R-16.safetensors "https://civitai.com/api/download/models/293240" && \
    wget -q -O /app/models/unet/qwen_image_fp8_e4m3fn.safetensors "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/diffusion_models/qwen_image_fp8_e4m3fn.safetensors" && \
    wget -q -O /app/models/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors" && \
    wget -q -O /app/models/loras/Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors "https://huggingface.co/lightx2v/Qwen-Image-Lightning/resolve/main/Qwen-Image-Edit-2509/Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors?download=true" && \
    wget -q -O /app/models/vae/qwen_image_vae.safetensors "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors" && \
    wget -q -O /app/models/text_encoders/umt5xxl-encoder-q8_0.gguf "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5xxl-encoder-q8_0.gguf?download=true" && \
    wget -q -O /app/models/unet/Wan2.2-T2V-A14B-LowNoise-Q8_0.gguf "https://huggingface.co/kj-nodes/Wan-Video-2.2/resolve/main/Wan2.2-T2V-A14B-LowNoise-Q8_0.gguf?download=true" && \
    wget -q -O /app/models/vae/wan_2.1_vae.safetensors "https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors" && \
    wget -q -O /app/models/loras/Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors "https://huggingface.co/kj-nodes/Wan-Video-2.1-Samples-and-workflows/resolve/main/Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors"


# Copy the entrypoint script and make it executable
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
