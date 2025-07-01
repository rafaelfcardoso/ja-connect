"""
PDF catalog generation engine using WeasyPrint and Jinja2.
"""

import os
import logging
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path
import jinja2
import weasyprint
from dotenv import load_dotenv


class CatalogGenerator:
    def __init__(self):
        load_dotenv()
        self.output_dir = Path(os.getenv('OUTPUT_DIR', './output'))
        self.template_dir = Path(os.getenv('TEMPLATE_DIR', './templates'))
        self.logger = logging.getLogger(__name__)
        
        # Ensure output directory exists
        self.output_dir.mkdir(exist_ok=True)
        
        # Set up Jinja2 environment
        self.jinja_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(self.template_dir),
            autoescape=jinja2.select_autoescape(['html', 'xml'])
        )
        
        # Add custom filters
        self.jinja_env.filters['format_price'] = self._format_price
        self.jinja_env.filters['fallback_image'] = self._fallback_image
    
    def generate_catalog(self, products: List[Dict[str, Any]], filename: str = None) -> str:
        """
        Generate PDF catalog from product data.
        
        Args:
            products: List of product dictionaries
            filename: Optional custom filename for the PDF
            
        Returns:
            Path to the generated PDF file
        """
        if not products:
            raise ValueError("No products provided for catalog generation")
        
        # Generate filename if not provided
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"catalogo_ja_distribuidora_{timestamp}.pdf"
        
        # Ensure filename has .pdf extension
        if not filename.endswith('.pdf'):
            filename += '.pdf'
        
        output_path = self.output_dir / filename
        
        try:
            # Render HTML template
            html_content = self._render_template(products)
            
            # Generate PDF
            self._generate_pdf(html_content, output_path)
            
            self.logger.info(f"Catalog generated successfully: {output_path}")
            return str(output_path)
            
        except Exception as e:
            self.logger.error(f"Error generating catalog: {str(e)}")
            raise
    
    def _render_template(self, products: List[Dict[str, Any]]) -> str:
        """
        Render HTML template with product data.
        
        Args:
            products: List of product dictionaries
            
        Returns:
            Rendered HTML string
        """
        try:
            template = self.jinja_env.get_template('catalog.html')
            
            # Prepare template context
            context = {
                'products': products,
                'generation_date': datetime.now().strftime("%d/%m/%Y %H:%M"),
                'total_products': len(products)
            }
            
            return template.render(**context)
            
        except jinja2.TemplateNotFound:
            raise FileNotFoundError(f"Template file 'catalog.html' not found in {self.template_dir}")
        except Exception as e:
            self.logger.error(f"Error rendering template: {str(e)}")
            raise
    
    def _generate_pdf(self, html_content: str, output_path: Path) -> None:
        """
        Convert HTML content to PDF using WeasyPrint.
        
        Args:
            html_content: HTML string to convert
            output_path: Path where PDF should be saved
        """
        try:
            # Create HTML document
            html_doc = weasyprint.HTML(string=html_content, base_url=str(self.template_dir))
            
            # Generate PDF with A4 page size
            html_doc.write_pdf(str(output_path))
            
        except Exception as e:
            self.logger.error(f"Error generating PDF: {str(e)}")
            raise
    
    def _format_price(self, price: float) -> str:
        """
        Format price as Brazilian Real currency.
        
        Args:
            price: Price value
            
        Returns:
            Formatted price string
        """
        if price is None:
            return "Preço sob consulta"
        
        return f"R$ {price:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
    
    def _fallback_image(self, image_url: str) -> str:
        """
        Provide fallback image URL if image is missing.
        
        Args:
            image_url: Original image URL
            
        Returns:
            Image URL or fallback placeholder
        """
        if not image_url:
            # Return a simple data URL for a gray placeholder
            return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23f0f0f0'/%3E%3Ctext x='60' y='60' text-anchor='middle' dy='0.35em' fill='%23999' font-family='Arial' font-size='12'%3ESem imagem%3C/text%3E%3C/svg%3E"
        
        return image_url