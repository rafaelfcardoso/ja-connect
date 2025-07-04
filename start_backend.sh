#!/bin/bash
cd /Users/Rafael/Projects/JA-Distribuidora
source venv_new/bin/activate
cd src
echo "Starting JA Distribuidora API Server..."
python api_server.py