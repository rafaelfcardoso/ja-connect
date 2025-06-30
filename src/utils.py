"""
Utility functions for the JA Distribuidora catalog generation application.
"""

import os
import re
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename by removing invalid characters.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename safe for filesystem use
    """
    # Remove invalid characters for most filesystems
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # Remove leading/trailing dots and spaces
    filename = filename.strip('. ')
    
    # Limit length to reasonable size
    if len(filename) > 200:
        name, ext = os.path.splitext(filename)
        filename = name[:200-len(ext)] + ext
    
    return filename


def ensure_directory(path: str) -> Path:
    """
    Ensure directory exists, create if necessary.
    
    Args:
        path: Directory path
        
    Returns:
        Path object for the directory
    """
    dir_path = Path(path)
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path


def is_valid_url(url: str) -> bool:
    """
    Check if a string is a valid URL.
    
    Args:
        url: URL string to validate
        
    Returns:
        True if valid URL, False otherwise
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False


def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human readable format.
    
    Args:
        size_bytes: File size in bytes
        
    Returns:
        Formatted file size string
    """
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"


def get_project_root() -> Path:
    """
    Get the project root directory.
    
    Returns:
        Path to project root
    """
    current_path = Path(__file__).resolve()
    
    # Go up directories until we find CLAUDE.md (project marker)
    for parent in current_path.parents:
        if (parent / 'CLAUDE.md').exists():
            return parent
    
    # Fallback to current file's parent directory
    return current_path.parent


def validate_notion_token(token: str) -> bool:
    """
    Basic validation for Notion API token format.
    
    Args:
        token: Notion API token
        
    Returns:
        True if token format looks valid, False otherwise
    """
    if not token:
        return False
    
    # Notion tokens typically start with 'secret_' and are fairly long
    if token.startswith('secret_') and len(token) > 40:
        return True
    
    return False


def validate_notion_database_id(database_id: str) -> bool:
    """
    Basic validation for Notion database ID format.
    
    Args:
        database_id: Notion database ID
        
    Returns:
        True if database ID format looks valid, False otherwise
    """
    if not database_id:
        return False
    
    # Remove hyphens and check if it's a valid hex string of expected length
    clean_id = database_id.replace('-', '')
    
    if len(clean_id) == 32 and all(c in '0123456789abcdef' for c in clean_id.lower()):
        return True
    
    return False