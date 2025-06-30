"""
Notion API client for querying the Acessorios database.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from notion_client import Client
from dotenv import load_dotenv


class NotionClient:
    def __init__(self):
        load_dotenv()
        self.api_token = os.getenv('NOTION_API_TOKEN')
        self.database_id = os.getenv('NOTION_DATABASE_ID')
        
        if not self.api_token:
            raise ValueError("NOTION_API_TOKEN environment variable is required")
        if not self.database_id:
            raise ValueError("NOTION_DATABASE_ID environment variable is required")
        
        self.client = Client(auth=self.api_token)
        self.logger = logging.getLogger(__name__)
    
    def get_active_products(self) -> List[Dict[str, Any]]:
        """
        Query the Acessorios database for products where Catálogo Ativo is true.
        
        Returns:
            List of product data dictionaries
        """
        try:
            response = self.client.databases.query(
                database_id=self.database_id,
                filter={
                    "property": "Catálogo Ativo",
                    "checkbox": {
                        "equals": True
                    }
                }
            )
            
            products = []
            for page in response['results']:
                product = self._extract_product_data(page)
                if product:
                    products.append(product)
            
            self.logger.info(f"Retrieved {len(products)} active products from Notion")
            return products
            
        except Exception as e:
            self.logger.error(f"Error querying Notion database: {str(e)}")
            raise
    
    def _extract_product_data(self, page: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Extract product data from a Notion page object.
        
        Args:
            page: Notion page object
            
        Returns:
            Dictionary with product data or None if extraction fails
        """
        try:
            properties = page.get('properties', {})
            
            # Extract Name (Product name)
            nome_prop = properties.get('Name', {})
            nome = self._get_text_property(nome_prop)
            
            # Extract Valor (Price)
            preco_prop = properties.get('Valor', {})
            preco = self._get_number_property(preco_prop)
            
            # Extract SKU
            sku_prop = properties.get('SKU', {})
            sku = self._get_text_property(sku_prop)
            
            # Extract Código de Barras (Barcode)
            barcode_prop = properties.get('Código de Barras', {})
            barcode = self._get_text_property(barcode_prop)
            
            # Extract Files & media (Image)
            imagem_prop = properties.get('Files & media', {})
            imagem_url = self._get_file_property(imagem_prop)
            
            # Only return product if it has at least a name
            if not nome:
                return None
            
            return {
                'nome': nome,
                'preco': preco,
                'sku': sku or '',
                'barcode': barcode or '',
                'imagem_url': imagem_url
            }
            
        except Exception as e:
            self.logger.error(f"Error extracting product data: {str(e)}")
            return None
    
    def _get_text_property(self, prop: Dict[str, Any]) -> str:
        """Extract text value from Notion property."""
        prop_type = prop.get('type')
        
        if prop_type == 'title':
            title_list = prop.get('title', [])
            return ''.join([t.get('plain_text', '') for t in title_list])
        elif prop_type == 'rich_text':
            rich_text_list = prop.get('rich_text', [])
            return ''.join([t.get('plain_text', '') for t in rich_text_list])
        
        return ''
    
    def _get_number_property(self, prop: Dict[str, Any]) -> Optional[float]:
        """Extract number value from Notion property."""
        if prop.get('type') == 'number':
            return prop.get('number')
        return None
    
    def _get_file_property(self, prop: Dict[str, Any]) -> Optional[str]:
        """Extract file URL from Notion property."""
        if prop.get('type') == 'files':
            files = prop.get('files', [])
            if files:
                first_file = files[0]
                # Handle both external and uploaded files
                if first_file.get('type') == 'external':
                    return first_file.get('external', {}).get('url')
                elif first_file.get('type') == 'file':
                    return first_file.get('file', {}).get('url')
        return None