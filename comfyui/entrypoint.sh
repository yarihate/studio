#!/bin/sh
set -e

# Start ComfyUI
echo "Starting ComfyUI..."
python3 main.py --listen --port 8000
