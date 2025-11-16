# Use an official NVIDIA CUDA image as a base
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install wget, git, and Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    git \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set up the working directory
WORKDIR /app

# Clone the ComfyUI repository
RUN git clone https://github.com/comfyanonymous/ComfyUI.git .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
