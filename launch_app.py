#!/usr/bin/env python3
"""
Improved launch script for JA Distribuidora catalog system.
Properly manages background processes and provides health checks.
"""

import os
import sys
import time
import subprocess
import signal
import requests
from pathlib import Path

class AppLauncher:
    def __init__(self):
        self.api_process = None
        self.frontend_process = None
        self.project_root = Path(__file__).parent
        
    def cleanup(self):
        """Clean up any existing processes."""
        print("🧹 Cleaning up existing processes...")
        # Kill processes on our ports
        for port in [5173, 8000]:
            try:
                subprocess.run(f"lsof -ti:{port} | xargs -r kill -9", 
                             shell=True, capture_output=True)
            except:
                pass
        time.sleep(1)
        
    def start_api_server(self):
        """Start the FastAPI server in background."""
        print("🚀 Starting API server...")
        
        # Activate virtual environment and start API
        cmd = [
            "bash", "-c", 
            f"cd '{self.project_root}' && source venv_new/bin/activate && cd src && python api_server.py"
        ]
        
        self.api_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid  # Create new process group
        )
        
        # Wait for API to start
        for i in range(30):  # 30 second timeout
            try:
                response = requests.get("http://localhost:8000/api/health", timeout=1)
                if response.status_code == 200:
                    print("✅ API server started successfully")
                    return True
            except:
                time.sleep(1)
                
        print("❌ API server failed to start")
        return False
        
    def start_frontend(self):
        """Start the frontend development server."""
        print("🎨 Starting frontend development server...")
        
        frontend_dir = self.project_root / "frontend"
        
        self.frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid  # Create new process group
        )
        
        # Wait for frontend to start
        for i in range(30):  # 30 second timeout
            try:
                # Try multiple URLs
                for url in ["http://localhost:5173", "http://127.0.0.1:5173", "http://0.0.0.0:5173"]:
                    try:
                        response = requests.get(url, timeout=1)
                        if response.status_code == 200:
                            print(f"✅ Frontend server started successfully at {url}")
                            return url
                    except:
                        continue
                time.sleep(1)
            except:
                time.sleep(1)
                
        print("❌ Frontend server failed to start")
        return None
        
    def check_health(self):
        """Check if both servers are healthy."""
        try:
            # Check API
            api_response = requests.get("http://localhost:8000/api/health", timeout=2)
            api_healthy = api_response.status_code == 200
            
            # Check Frontend
            frontend_healthy = False
            for url in ["http://localhost:5173", "http://127.0.0.1:5173"]:
                try:
                    frontend_response = requests.get(url, timeout=2)
                    if frontend_response.status_code == 200:
                        frontend_healthy = True
                        break
                except:
                    continue
                    
            return api_healthy, frontend_healthy
        except:
            return False, False
            
    def stop_servers(self):
        """Stop both servers gracefully."""
        print("🛑 Stopping servers...")
        
        if self.api_process:
            try:
                os.killpg(os.getpgid(self.api_process.pid), signal.SIGTERM)
                self.api_process.wait(timeout=5)
            except:
                try:
                    os.killpg(os.getpgid(self.api_process.pid), signal.SIGKILL)
                except:
                    pass
                    
        if self.frontend_process:
            try:
                os.killpg(os.getpgid(self.frontend_process.pid), signal.SIGTERM)
                self.frontend_process.wait(timeout=5)
            except:
                try:
                    os.killpg(os.getpgid(self.frontend_process.pid), signal.SIGKILL)
                except:
                    pass
                    
    def launch(self):
        """Launch the complete system."""
        print("🏢 JA Distribuidora Catalog System - Improved Launcher")
        print("=" * 60)
        
        # Cleanup first
        self.cleanup()
        
        # Start API server
        if not self.start_api_server():
            print("❌ Failed to start API server. Exiting.")
            return False
            
        # Start frontend
        frontend_url = self.start_frontend()
        if not frontend_url:
            print("❌ Failed to start frontend server. Exiting.")
            self.stop_servers()
            return False
            
        # Final health check
        time.sleep(2)
        api_healthy, frontend_healthy = self.check_health()
        
        if api_healthy and frontend_healthy:
            print("\n🎉 SUCCESS! Both servers are running!")
            print("\n📍 Access your application:")
            print(f"   Frontend: {frontend_url}")
            print("   Alternative URLs:")
            print("     - http://localhost:5173")
            print("     - http://127.0.0.1:5173")
            print("   API: http://localhost:8000")
            print("   API Health: http://localhost:8000/api/health")
            
            print("\n🚀 Quick Start:")
            print("   1. Open any of the frontend URLs above")
            print("   2. Login to access the catalog")
            print("   3. Navigate to 'Catálogo' to see products")
            print("   4. Edit prices by hovering and clicking edit buttons")
            print("   5. Generate PDFs by selecting products")
            
            print("\n⏹️  Press Ctrl+C to stop both servers")
            
            try:
                while True:
                    time.sleep(5)
                    # Periodic health check
                    api_ok, frontend_ok = self.check_health()
                    if not api_ok or not frontend_ok:
                        print("⚠️  Warning: One or more servers became unhealthy")
                        break
            except KeyboardInterrupt:
                pass
            finally:
                self.stop_servers()
                print("✅ Servers stopped successfully!")
                
            return True
        else:
            print("❌ Health check failed!")
            print(f"   API Health: {'✅' if api_healthy else '❌'}")
            print(f"   Frontend Health: {'✅' if frontend_healthy else '❌'}")
            self.stop_servers()
            return False

def main():
    launcher = AppLauncher()
    success = launcher.launch()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()