# Use the official NVIDIA CUDA image as a base
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

# Install necessary packages
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

# Change working directory to the cloned repo
WORKDIR /app

# Install dependencies using the requirements.txt from the cloned repo
RUN pip install --no-cache-dir --timeout 600 -r requirements.txt

# Create directories for models
RUN mkdir -p /app/models/checkpoints && \
    mkdir -p /app/models/loras && \
    mkdir -p /app/models/vae && \
    mkdir -p /app/models/unet && \
    mkdir -p /app/models/gguf

# Download models
RUN wget -O /app/models/checkpoints/sd_xl_base_1.0.safetensors https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors && \
    wget -O /app/models/checkpoints/sd_xl_refiner_1.0.safetensors https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors && \
    wget -O /app/models/loras/Minute_Sketch_v2_R-16.safetensors https://huggingface.co/martynov/Minute_Sketch_v2_R-16/resolve/main/Minute_Sketch_v2_R-16.safetensors && \
    wget -O /app/models/checkpoints/qwen_image_fp8_e4m3fn.safetensors https://huggingface.co/Qwen/Qwen-Image/resolve/main/qwen_image_fp8_e4m3fn.safetensors && \
    wget -O /app/models/vae/qwen_image_vae.safetensors https://huggingface.co/Qwen/Qwen-Image/resolve/main/qwen_image_vae.safetensors && \
    wget -O /app/models/checkpoints/qwen_2.5_vl_7b_fp8_scaled.safetensors https://huggingface.co/Qwen/Qwen-VL/resolve/main/qwen_2.5_vl_7b_fp8_scaled.safetensors && \
    wget -O /app/models/loras/Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors https://huggingface.co/Kijai/Qwen-Image-Lora/resolve/main/Qwen-Image-Edit-2509-Lightning-4steps-V1.0-bf16.safetensors && \
    wget -O /app/models/unet/Wan2.2-T2V-A14B-LowNoise-Q8_0.gguf https://huggingface.co/alibaba-pai/Wan-2.2-T2V-A14B-GGUF/resolve/main/Wan2.2-T2V-A14B-LowNoise-Q8_0.gguf && \
    wget -O /app/models/gguf/umt5xxl-encoder-q8_0.gguf https://huggingface.co/Kijai/umt5-xxl-encoder-gguf/resolve/main/umt5xxl-encoder-q8_0.gguf && \
    wget -O /app/models/loras/Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors https://huggingface.co/Kijai/Wan-2.2-T2V-A14B/resolve/main/Wan21_T2V_14B_lightx2v_cfg_step_distill_lora_rank32.safetensors && \
    wget -O /app/models/vae/wan_2.1_vae.safetensors https://huggingface.co/Kijai/Wan-2.2-T2V-A14B/resolve/main/wan_2.1_vae.safetensors

# Copy the entrypoint script
COPY entrypoint.sh /app/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
