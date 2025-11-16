# 1. Базовый образ с поддержкой CUDA
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

# Устанавливаем переменные окружения, чтобы избежать интерактивных запросов
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC

# 2. Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    git \
    python3.11 \
    python3.11-venv \
    python3-pip \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 3. Клонируем репозиторий ComfyUI
WORKDIR /app
RUN git clone https://github.com/comfyanonymous/ComfyUI.git .

# 4. Устанавливаем PyTorch с поддержкой CUDA
RUN pip3 install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 5. Устанавливаем остальные зависимости ComfyUI
RUN pip3 install --no-cache-dir -r requirements.txt

# 6. Скачиваем модели
RUN mkdir -p models/checkpoints models/loras
# SDXL Base Model
RUN wget -q -O models/checkpoints/sd_xl_base_1.0.safetensors https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors
# SDXL Refiner Model
RUN wget -q -O models/checkpoints/sd_xl_refiner_1.0.safetensors https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors
# LoRA "Minute_Sketch"
RUN wget -q -O models/loras/Minute_Sketch_v2_R-16.safetensors https://civitai.com/api/download/models/293240

# 7. Запускаем ComfyUI
# Запускаем без флага --cpu, чтобы он использовал GPU
CMD ["python3", "main.py", "--listen", "0.0.0.0", "--port", "8000"]
