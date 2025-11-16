# Используем базовый образ с Python и поддержкой CUDA
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

# Устанавливаем системные зависимости, включая Python, Git и curl
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3.11 \
    python3-pip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Клонируем репозиторий ComfyUI
RUN git clone https://github.com/comfyanonymous/ComfyUI.git .

# Устанавливаем зависимости Python для ComfyUI, включая torch с поддержкой CUDA
RUN pip install --no-cache-dir torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121
RUN pip install --no-cache-dir -r requirements.txt

# --- Скачивание моделей ---

# Создаем директории для моделей
RUN mkdir -p models/checkpoints models/loras

# Скачиваем SDXL Base Model
RUN curl -L -o models/checkpoints/sd_xl_base_1.0.safetensors https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors

# Скачиваем SDXL Refiner Model
RUN curl -L -o models/checkpoints/sd_xl_refiner_1.0.safetensors https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors

# Скачиваем LoRA "Minute_Sketch", используя curl для надежности
RUN curl -L -o models/loras/Minute_Sketch_v2_R-16.safetensors https://civitai.com/api/download/models/293240


# --- Копирование Workflow ---
# Workflow JSON-ы уже являются частью кода Node.js и передаются через API,
# поэтому копировать их не нужно.

# Запускаем ComfyUI с параметром --listen, чтобы он был доступен извне контейнера
# GPU будет использоваться по умолчанию, если доступен
CMD ["python", "main.py", "--listen", "0.0.0.0", "--port", "8000"]
