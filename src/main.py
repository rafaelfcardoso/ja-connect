#!/usr/bin/env python3
"""
JA Distribuidora - Catalog Generation Application

Main CLI application for generating product catalogs from Notion database.
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from dotenv import load_dotenv

from notion_api import NotionClient
from catalog_generator import CatalogGenerator


def setup_logging(debug: bool = False) -> None:
    """Set up logging configuration."""
    level = logging.DEBUG if debug else logging.INFO
    
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )


def validate_environment() -> bool:
    """
    Validate that required environment variables are set.
    
    Returns:
        True if all required variables are present, False otherwise
    """
    load_dotenv()
    
    required_vars = ['NOTION_API_TOKEN', 'NOTION_DATABASE_ID']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please create a .env file based on .env.example and fill in the required values.")
        return False
    
    return True


def main():
    """Main application entry point."""
    parser = argparse.ArgumentParser(
        description='Generate product catalog PDF from Notion database',
        prog='JA Distribuidora Catalog Generator'
    )
    
    parser.add_argument(
        '--output', '-o',
        type=str,
        help='Custom output directory for generated PDF'
    )
    
    parser.add_argument(
        '--filename', '-f',
        type=str,
        help='Custom filename for the generated PDF'
    )
    
    parser.add_argument(
        '--debug', '-d',
        action='store_true',
        help='Enable debug logging'
    )
    
    args = parser.parse_args()
    
    # Set up logging
    setup_logging(args.debug)
    logger = logging.getLogger(__name__)
    
    try:
        # Validate environment
        if not validate_environment():
            sys.exit(1)
        
        # Override output directory if specified
        if args.output:
            os.environ['OUTPUT_DIR'] = args.output
            Path(args.output).mkdir(parents=True, exist_ok=True)
        
        print("🚀 Starting catalog generation...")
        
        # Initialize clients
        logger.info("Initializing Notion client...")
        notion_client = NotionClient()
        
        logger.info("Initializing catalog generator...")
        catalog_generator = CatalogGenerator()
        
        # Fetch products from Notion
        print("📊 Fetching products from Notion database...")
        products = notion_client.get_active_products()
        
        if not products:
            print("⚠️  No active products found in the database.")
            print("Make sure you have products with 'Catálogo Ativo' checked in your Notion database.")
            sys.exit(1)
        
        print(f"✅ Found {len(products)} active products")
        
        # Generate catalog
        print("📄 Generating PDF catalog...")
        output_path = catalog_generator.generate_catalog(products, args.filename)
        
        print(f"🎉 Catalog generated successfully!")
        print(f"📁 Output file: {output_path}")
        
        # Print file size
        file_size = Path(output_path).stat().st_size
        size_mb = file_size / (1024 * 1024)
        print(f"📊 File size: {size_mb:.2f} MB")
        
    except KeyboardInterrupt:
        print("\n⚠️  Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Application error: {str(e)}")
        print(f"❌ Error: {str(e)}")
        
        if args.debug:
            import traceback
            traceback.print_exc()
        
        sys.exit(1)


if __name__ == '__main__':
    main()