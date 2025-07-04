"""
FastAPI server to serve product data and handle catalog generation.
"""

import os
import logging
from typing import List, Dict, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

try:
    # Try relative imports first (for package mode)
    from .notion_api import NotionClient
    from .catalog_generator import CatalogGenerator
    from .utils import setup_logging
    from .auth import (
        user_manager, UserLogin, UserCreate, Token, UserResponse,
        create_tokens, verify_token, UserInDB
    )
except ImportError:
    # Fall back to absolute imports (for direct execution)
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    from notion_api import NotionClient
    from catalog_generator import CatalogGenerator
    from utils import setup_logging
    from auth import (
        user_manager, UserLogin, UserCreate, Token, UserResponse,
        create_tokens, verify_token, UserInDB
    )

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
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Frontend service (nginx)
        "https://jadistribuidora.site",  # Production domain
        "https://www.jadistribuidora.site",  # Production domain with www
        "https://app.jadistribuidora.site",  # Production domain with app prefix
        "http://ja-distribuidora-frontend:3000",  # Docker service-to-service
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
notion_client = NotionClient()
catalog_generator = CatalogGenerator()

# Security
security = HTTPBearer()

# Mount static files for frontend
frontend_dist_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
if os.path.exists(frontend_dist_path):
    # Mount assets directory for static files
    assets_path = os.path.join(frontend_dist_path, 'assets')
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
        logger.info(f"Frontend assets mounted from: {assets_path}")
    
    # Mount other static files
    app.mount("/static", StaticFiles(directory=frontend_dist_path), name="static")
    logger.info(f"Frontend static files mounted from: {frontend_dist_path}")
else:
    logger.warning(f"Frontend dist directory not found: {frontend_dist_path}")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserInDB:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
        user = user_manager.get_user(email)
        if user is None:
            raise credentials_exception
            
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
            
        return user
    except Exception:
        raise credentials_exception

async def get_current_admin_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """Get current authenticated admin user."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Pydantic models for request/response
class Product(BaseModel):
    id: str = None
    nome: str
    preco: float = None
    sku: str = ""
    barcode: str = ""
    imagem_url: str = None

class PriceUpdateRequest(BaseModel):
    product_id: str
    new_price: float

class UserRegister(BaseModel):
    email: str
    full_name: str
    password: str

class CatalogRequest(BaseModel):
    selected_products: List[Dict[str, Any]]
    title: str = "Catálogo JA Distribuidora"

class CatalogResponse(BaseModel):
    success: bool
    message: str
    file_path: str = None
    file_name: str = None

# Authentication endpoints
@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Authenticate user and return JWT tokens."""
    try:
        user = user_manager.authenticate_user(user_credentials.email, user_credentials.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        tokens = create_tokens(user)
        logger.info(f"User {user.email} logged in successfully")
        return tokens
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    """Register a new user and return JWT tokens."""
    try:
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate password strength
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Create user with default "user" role
        user_create_data = UserCreate(
            email=user_data.email.lower().strip(),
            full_name=user_data.full_name.strip(),
            password=user_data.password,
            role="user"
        )
        
        new_user = user_manager.create_user(user_create_data)
        
        # Generate tokens for immediate login
        tokens = create_tokens(new_user)
        
        logger.info(f"New user registered successfully: {new_user.email}")
        return tokens
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@app.post("/api/auth/logout")
async def logout(current_user: UserInDB = Depends(get_current_user)):
    """Logout user (token invalidation handled client-side)."""
    logger.info(f"User {current_user.email} logged out")
    return {"message": "Successfully logged out"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserInDB = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse(
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@app.post("/api/auth/create-user", response_model=UserResponse)
async def create_user(user_data: UserCreate, admin_user: UserInDB = Depends(get_current_admin_user)):
    """Create new user (admin only)."""
    try:
        new_user = user_manager.create_user(user_data)
        logger.info(f"Admin {admin_user.email} created new user: {new_user.email}")
        return UserResponse(
            email=new_user.email,
            full_name=new_user.full_name,
            role=new_user.role,
            is_active=new_user.is_active,
            created_at=new_user.created_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User creation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

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
async def get_products(current_user: UserInDB = Depends(get_current_user)):
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

@app.put("/api/products/{product_id}/price")
async def update_product_price(product_id: str, request: PriceUpdateRequest, current_user: UserInDB = Depends(get_current_user)):
    """Update the price of a specific product in Notion database."""
    try:
        # Validate price
        if request.new_price < 0:
            raise HTTPException(status_code=400, detail="Price cannot be negative")
        
        # Validate product_id matches request
        if product_id != request.product_id:
            raise HTTPException(status_code=400, detail="Product ID mismatch")
        
        logger.info(f"User {current_user.email} updating price for product {product_id} to {request.new_price}")
        
        # Update price in Notion
        success = notion_client.update_product_price(product_id, request.new_price)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update product price in Notion")
        
        logger.info(f"Successfully updated price for product {product_id} by {current_user.email}")
        
        return {
            "success": True,
            "message": f"Price updated successfully to {request.new_price}",
            "product_id": product_id,
            "new_price": request.new_price
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product price: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update product price: {str(e)}")

@app.post("/api/generate-catalog")
async def generate_catalog(request: CatalogRequest, background_tasks: BackgroundTasks, current_user: UserInDB = Depends(get_current_user)):
    """Generate PDF catalog from selected products."""
    try:
        if not request.selected_products:
            raise HTTPException(status_code=400, detail="No products selected for catalog generation")
        
        logger.info(f"User {current_user.email} generating catalog with {len(request.selected_products)} products")
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"catalogo_ja_distribuidora_{timestamp}.pdf"
        
        # Generate catalog
        output_path = catalog_generator.generate_catalog(
            products=request.selected_products,
            filename=output_filename
        )
        
        logger.info(f"Catalog generated successfully by {current_user.email}: {output_path}")
        
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
async def download_catalog(filename: str, current_user: UserInDB = Depends(get_current_user)):
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

# Serve frontend for all non-API routes (SPA fallback)
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve frontend HTML for all non-API routes."""
    # Skip API routes
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    frontend_dist_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
    
    # Try to serve static files directly first
    requested_file = os.path.join(frontend_dist_path, full_path)
    if os.path.exists(requested_file) and os.path.isfile(requested_file):
        return FileResponse(requested_file)
    
    # Serve index.html for all frontend routes (SPA fallback)
    index_path = os.path.join(frontend_dist_path, 'index.html')
    
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        return HTMLResponse(content=html_content, status_code=200)
    else:
        raise HTTPException(status_code=404, detail="Frontend not found")

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