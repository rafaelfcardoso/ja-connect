"""
FastAPI server to serve product data and handle catalog generation.
"""

import os
import logging
from typing import List, Dict, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from notion_api import NotionClient
from catalog_generator import CatalogGenerator
from utils import setup_logging

# Configure logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="JA Distribuidora Catalog API",
    description="API for managing product catalog generation",
    version="1.0.0"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
notion_client = NotionClient()
catalog_generator = CatalogGenerator()

# Pydantic models for request/response
class Product(BaseModel):
    nome: str
    preco: float = None
    sku: str = ""
    barcode: str = ""
    imagem_url: str = None

class CatalogRequest(BaseModel):
    selected_products: List[Dict[str, Any]]
    title: str = "Catálogo JA Distribuidora"

class CatalogResponse(BaseModel):
    success: bool
    message: str
    file_path: str = None
    file_name: str = None

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "JA Distribuidora Catalog API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check."""
    try:
        # Test Notion connection
        products = notion_client.get_active_products()
        notion_status = "connected"
        product_count = len(products)
    except Exception as e:
        notion_status = f"error: {str(e)}"
        product_count = 0
    
    return {
        "status": "healthy",
        "notion_status": notion_status,
        "active_products": product_count,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/products")
async def get_products():
    """Get all active products from Notion database."""
    try:
        logger.info("Fetching active products from Notion")
        products = notion_client.get_active_products()
        
        logger.info(f"Retrieved {len(products)} active products")
        return {
            "success": True,
            "products": products,
            "count": len(products)
        }
    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

@app.post("/api/generate-catalog")
async def generate_catalog(request: CatalogRequest, background_tasks: BackgroundTasks):
    """Generate PDF catalog from selected products."""
    try:
        if not request.selected_products:
            raise HTTPException(status_code=400, detail="No products selected for catalog generation")
        
        logger.info(f"Generating catalog with {len(request.selected_products)} products")
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"catalogo_ja_distribuidora_{timestamp}.pdf"
        
        # Generate catalog
        output_path = catalog_generator.generate_catalog(
            products=request.selected_products,
            filename=output_filename
        )
        
        logger.info(f"Catalog generated successfully: {output_path}")
        
        return CatalogResponse(
            success=True,
            message=f"Catalog generated successfully with {len(request.selected_products)} products",
            file_path=output_path,
            file_name=output_filename
        )
    
    except Exception as e:
        logger.error(f"Error generating catalog: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate catalog: {str(e)}")

@app.get("/api/download/{filename}")
async def download_catalog(filename: str):
    """Download generated catalog PDF."""
    try:
        # Security check - only allow PDF files and sanitize filename
        if not filename.endswith('.pdf') or '..' in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        output_dir = os.path.join(os.path.dirname(__file__), '..', 'output')
        file_path = os.path.join(output_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='application/pdf'
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("API_HOST", "127.0.0.1")
    port = int(os.getenv("API_PORT", "8000"))
    
    logger.info(f"Starting API server on {host}:{port}")
    
    uvicorn.run(
        "api_server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )