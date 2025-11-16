# Используем базовый образ с Python и поддержкой CUDA
FROM nvidia/cuda:12.1.0-base-ubuntu22.04

# Устанавливаем системные зависимости, включая Git и wget для скачивания
RUN apt-get update && apt-get install -y \
    git \
    wget \
    python3.11 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Клонируем репозиторий ComfyUI
RUN git clone https://github.com/comfyanonymous/ComfyUI.git .

# Устанавливаем PyTorch с поддержкой CUDA
RUN pip3 install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121

# Устанавливаем зависимости Python для ComfyUI
RUN pip3 install --no-cache-dir -r requirements.txt

# --- Скачивание моделей ---

# Создаем директории для моделей
RUN mkdir -p models/checkpoints models/loras

# Скачиваем SDXL Base Model
RUN wget -q -O models/checkpoints/sd_xl_base_1.0.safetensors https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors

# Скачиваем SDXL Refiner Model
RUN wget -q -O models/checkpoints/sd_xl_refiner_1.0.safetensors https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors

# Скачиваем LoRA "Minute_Sketch", добавляя User-Agent, чтобы избежать ошибки 403
RUN wget --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36" -q -O models/loras/Minute_Sketch_v2_R-16.safetensors https://civitai.com/api/download/models/293240

# --- Копирование Workflow ---
# Workflow передаются через API, поэтому копировать их не нужно

# Запускаем ComfyUI с параметром --listen, чтобы он был доступен извне контейнера
# Флаг --cuda-device-id 0 указывает на использование первого GPU
CMD ["python3", "main.py", "--listen", "0.0.0.0", "--port", "8000", "--cuda-device-id", "0"]
