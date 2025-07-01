#!/usr/bin/env python3
"""
Startup script for JA Distribuidora catalog system.
Starts both the API server and frontend development server.
"""

import os
import sys
import time
import subprocess
import signal
from pathlib import Path

def start_api_server():
    """Start the FastAPI server."""
    print("🚀 Starting API server...")
    api_process = subprocess.Popen(
        [sys.executable, "src/api_server.py"],
        cwd=Path(__file__).parent,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    return api_process

def start_frontend():
    """Start the frontend development server."""
    print("🎨 Starting frontend development server...")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=Path(__file__).parent / "frontend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    return frontend_process

def main():
    print("🏢 JA Distribuidora Catalog System")
    print("=" * 50)
    
    # Start both servers
    api_process = start_api_server()
    time.sleep(2)  # Give API server time to start
    
    frontend_process = start_frontend()
    time.sleep(3)  # Give frontend time to start
    
    print("\n✅ System started successfully!")
    print("\n📍 Access points:")
    print("   Frontend: http://localhost:5173")
    print("   API: http://localhost:8000")
    print("   API Health: http://localhost:8000/api/health")
    
    print("\n📋 Quick test:")
    print("   1. Open http://localhost:5173")
    print("   2. Click 'Catálogo' in the sidebar")
    print("   3. You should see all 29 products from Notion")
    print("   4. Select products and click 'Gerar Catálogo'")
    
    print("\n⏹️  Press Ctrl+C to stop both servers")
    
    try:
        # Wait for processes
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping servers...")
        api_process.terminate()
        frontend_process.terminate()
        
        # Wait for graceful shutdown
        api_process.wait(timeout=5)
        frontend_process.wait(timeout=5)
        
        print("✅ Servers stopped successfully!")

if __name__ == "__main__":
    main()