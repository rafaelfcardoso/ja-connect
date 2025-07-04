# 🚀 JA Distribuidora Launch Guide

## 🎯 Quick Start (Recommended)

### Option 1: Use Two Terminal Windows

**Terminal 1 - Backend API Server:**
```bash
cd /Users/Rafael/Projects/JA-Distribuidora
./start_backend.sh
```

**Terminal 2 - Frontend Development Server:**
```bash
cd /Users/Rafael/Projects/JA-Distribuidora
./start_frontend.sh
```

### Option 2: Manual Commands

**Terminal 1 - Backend:**
```bash
cd /Users/Rafael/Projects/JA-Distribuidora
source venv_new/bin/activate
cd src
python api_server.py
```

**Terminal 2 - Frontend:**
```bash
cd /Users/Rafael/Projects/JA-Distribuidora/frontend
npm run dev
```

## 📍 Access Points

Once both servers are running, you can access:

- **Frontend Application**: http://localhost:5173/
- **Alternative Frontend**: http://127.0.0.1:5173/
- **API Server**: http://localhost:8000
- **API Health Check**: http://localhost:8000/api/health

## ✅ How to Verify Everything is Working

1. **Check API Server**: Visit http://localhost:8000/api/health
   - Should show: `{"status":"healthy","notion_status":"connected",...}`

2. **Check Frontend**: Visit http://localhost:5173/
   - Should show the JA Distribuidora login page

3. **Both terminals should show**:
   - Backend: `INFO: Application startup complete.`
   - Frontend: `➜ Local: http://localhost:5173/`

## 🔧 Troubleshooting

### If Frontend Won't Connect:
```bash
# Kill any processes on port 5173
lsof -ti:5173 | xargs kill -9

# Navigate to frontend directory
cd /Users/Rafael/Projects/JA-Distribuidora/frontend

# Check environment variables
cat .env.local

# Should show: VITE_API_URL=http://localhost:8000

# Restart frontend
npm run dev
```

### If API Server Won't Start:
```bash
# Kill any processes on port 8000
lsof -ti:8000 | xargs kill -9

# Navigate to project root
cd /Users/Rafael/Projects/JA-Distribuidora

# Activate virtual environment
source venv_new/bin/activate

# Test Python environment
python --version  # Should show Python 3.13.5

# Start API server
cd src
python api_server.py
```

### If CORS Errors Appear:
Check that `.env.local` in the frontend directory contains:
```
VITE_API_URL=http://localhost:8000
```

## 🎉 Features Available

Once logged in, you can:

1. **View Product Catalog**: Navigate to "Catálogo" in the sidebar
2. **Edit Product Prices**: Hover over any price and click the edit button
3. **Generate PDF Catalogs**: Select products and click "Gerar Catálogo"
4. **Real-time Notion Updates**: Price changes sync immediately to your database

## 🛑 Stopping the Servers

Press `Ctrl+C` in each terminal window to stop the respective server.

## 📋 System Requirements Met

- ✅ Python 3.13.5 with virtual environment
- ✅ Node.js v22.12.0 and npm 10.9.0
- ✅ All dependencies installed
- ✅ Notion API integration working
- ✅ Environment variables configured
- ✅ CORS properly configured
- ✅ Price editing feature implemented