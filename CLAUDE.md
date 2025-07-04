# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# JA Distribuidora - Product Catalog Generation System

## Overview
A dual-system for generating PDF product catalogs from Notion database: standalone Python CLI and web interface with React frontend + FastAPI backend.

## Common Commands

### Backend Development
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run standalone CLI catalog generator
python src/main.py

# CLI with custom options
python src/main.py --output ./custom_output/ --filename "my_catalog.pdf" --debug

# Start API server only
python src/api_server.py

# Test Notion connection
python validate_notion.py
```

### Frontend Development
```bash
# Install frontend dependencies
cd frontend && npm install

# Start frontend dev server
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build

# Lint frontend code
cd frontend && npm run lint
```

### Full System
```bash
# Start both API server and frontend (recommended)
python start_system.py

# Docker deployment (production)
docker-compose up -d

# Docker build and deploy
docker-compose build && docker-compose up -d
```

## Architecture

### Core Components
- **`src/main.py`** - CLI application entry point with argument parsing
- **`src/api_server.py`** - FastAPI backend serving React frontend and handling catalog generation
- **`src/notion_api.py`** - Notion API client for fetching product data
- **`src/catalog_generator.py`** - PDF generation using WeasyPrint + Jinja2 templates
- **`start_system.py`** - Orchestrates both backend and frontend servers

### Frontend Structure
- **React + TypeScript + Vite** setup with Tailwind CSS
- **Features**: Dashboard, Catalog (product selection), Downloads, Settings
- **Components**: Reusable UI components in `shared/components/ui/`
- **Routing**: React Router with feature-based organization in `features/`

### Data Flow
1. Notion API fetches products from "Acessorios" table (only `Catálogo Ativo == true`)
2. Products processed through `catalog_generator.py` using Jinja2 templates
3. WeasyPrint converts HTML/CSS to PDF with Brazilian Real formatting
4. CLI outputs to `output/` directory, web interface serves via FastAPI

### Template System
- **`templates/catalog.html`** - Jinja2 template for PDF structure
- **`templates/styles.css`** - Styling with JA Distribuidora branding
- **`templates/assets/ja_logo.png`** - Company logo for headers

## Configuration

### Environment Variables (.env)
```bash
NOTION_API_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=20009e6acd3480e19a27f3364f6c209d
OUTPUT_DIR=./output
TEMPLATE_DIR=./templates
```

### Frontend Environment Variables
```bash
# Development (frontend/.env)
VITE_API_URL=http://localhost:8000

# Production (frontend/.env.production)
VITE_API_URL=https://jadistribuidora.site
```

### Database Schema (Notion "Acessorios" table)
- `Nome` (text) - Product name
- `Preço` (number) - Product price  
- `Imagem` (files/URL) - Product image
- `SKU` (text) - Internal product code
- `Barcode` (text) - Barcode number
- `Catálogo Ativo` (checkbox) - Controls inclusion in catalog

## Development Notes

### PDF Generation
- Uses WeasyPrint for HTML→PDF conversion
- Jinja2 templating with custom filters for price formatting
- Output defaults to `catalogo_ja_distribuidora_YYYYMMDD_HHMMSS.pdf` format
- All PDFs saved to `output/` directory

### API Endpoints
- `GET /api/products` - Fetch all active products from Notion
- `POST /api/generate-catalog` - Generate PDF from selected products  
- `GET /api/download/{filename}` - Download generated PDF files
- `GET /api/health` - Health check including Notion connectivity

### Frontend-Backend Communication
- Frontend runs on port 5173 (Vite dev server)
- API server runs on port 8000
- CORS configured for development (localhost) and production (jadistribuidora.site)
- React Query for state management and API calls
- Environment-specific API URLs via VITE_API_URL

### File Locations
- Generated PDFs: `output/`
- Python source: `src/`
- Frontend code: `frontend/src/`
- Templates: `templates/`
- Static assets: `templates/assets/` and `frontend/public/`

## Deployment

### Docker Configuration
- `Dockerfile` - Multi-stage build for production deployment
- `docker-compose.yml` - Local development and production deployment
- `easypanel.yml` - VPS deployment with Easypanel
- `deployment-guide.md` - Complete deployment instructions

### Production Domain
- Production URL: `https://app.jadistribuidora.site`
- CORS configured for both development and production domains
- SSL/HTTPS ready configuration

### VPS Git Operations
When working on the VPS (ssh root@31.97.247.150), use the following command to push changes:
```bash
# Use the GitHub token for authentication
git push https://[GITHUB_TOKEN]@github.com/rafaelfcardoso/ja-connect.git main
```
**Note:** Replace `[GITHUB_TOKEN]` with the actual GitHub Personal Access Token when pushing.