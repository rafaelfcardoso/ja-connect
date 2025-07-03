"""
Authentication module for JA Distribuidora Catalog API.
Handles user authentication, JWT token generation, and user management.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
from fastapi import HTTPException, status
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic Models
class User(BaseModel):
    email: str
    full_name: str
    role: str = "user"  # "admin" or "user"
    is_active: bool = True
    created_at: datetime = None

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserResponse(BaseModel):
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

class UserManager:
    """Simple user management using JSON file storage."""
    
    def __init__(self, users_file: str = "users.json"):
        self.users_file = os.path.join(os.path.dirname(__file__), '..', users_file)
        self.users = self._load_users()
    
    def _load_users(self) -> Dict[str, UserInDB]:
        """Load users from JSON file or create default admin user."""
        try:
            if os.path.exists(self.users_file):
                with open(self.users_file, 'r') as f:
                    users_data = json.load(f)
                    return {
                        email: UserInDB(**user_data) 
                        for email, user_data in users_data.items()
                    }
            else:
                # Create default admin user
                default_users = self._create_default_users()
                self._save_users(default_users)
                return default_users
        except Exception as e:
            logger.error(f"Error loading users: {e}")
            return self._create_default_users()
    
    def _create_default_users(self) -> Dict[str, UserInDB]:
        """Create default admin user."""
        admin_email = os.getenv("ADMIN_EMAIL", "admin@jadistribuidora.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        
        return {
            admin_email: UserInDB(
                email=admin_email,
                full_name="JA Distribuidora Admin",
                role="admin",
                is_active=True,
                created_at=datetime.now(),
                hashed_password=get_password_hash(admin_password)
            )
        }
    
    def _save_users(self, users: Dict[str, UserInDB] = None):
        """Save users to JSON file."""
        users_to_save = users or self.users
        try:
            # Convert to serializable format
            users_data = {}
            for email, user in users_to_save.items():
                user_dict = user.dict()
                if user_dict.get('created_at'):
                    user_dict['created_at'] = user_dict['created_at'].isoformat()
                users_data[email] = user_dict
            
            with open(self.users_file, 'w') as f:
                json.dump(users_data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving users: {e}")
    
    def get_user(self, email: str) -> Optional[UserInDB]:
        """Get user by email."""
        return self.users.get(email)
    
    def create_user(self, user_data: UserCreate) -> UserInDB:
        """Create a new user."""
        if user_data.email in self.users:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )
        
        user = UserInDB(
            email=user_data.email,
            full_name=user_data.full_name,
            role=user_data.role,
            is_active=True,
            created_at=datetime.now(),
            hashed_password=get_password_hash(user_data.password)
        )
        
        self.users[user_data.email] = user
        self._save_users()
        return user
    
    def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """Authenticate user with email and password."""
        user = self.get_user(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def get_all_users(self) -> Dict[str, UserInDB]:
        """Get all users (admin only)."""
        return self.users

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)

# JWT utilities
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def create_tokens(user: UserInDB) -> Token:
    """Create both access and refresh tokens for user."""
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

# Initialize user manager
user_manager = UserManager()