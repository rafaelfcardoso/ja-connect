# JA Distribuidora - Product Catalog Generation Project

## 📋 Project Overview

This project implements a product catalog generation system that creates PDF catalogs from a Notion database for distribution via WhatsApp. The solution provides both an n8n automation flow and a standalone Python application for offline generation.

## 🎯 Problem Statement

- Manual catalog creation is time-consuming and error-prone
- Commercial apps require paid plans and constant connectivity
- Need for a simple, cost-free, offline-capable solution
- Integration with existing Notion product database

## 💡 Solution Architecture

### Dual Approach:
1. **n8n Flow**: Automated webhook-triggered catalog generation using PDFMonkey
2. **Python Script**: Standalone offline solution using WeasyPrint

## 🗃️ Data Source

- **Database**: Notion "Acessorios" table
- **Database ID**: `20009e6acd3480e19a27f3364f6c209d`
- **URL**: https://www.notion.so/20009e6acd3480e19a27f3364f6c209d?v=20009e6acd3480119fad000cc0dda930

### Database Schema:
- `Nome` (text) - Product name
- `Preço` (number) - Product price
- `Imagem` (files/URL) - Product image
- `SKU` (text) - Internal product code
- `Barcode` (text) - Barcode number
- `Catálogo Ativo` (checkbox) - Active in catalog flag

## 🚀 Implementation Plan

### Phase 1: Core Python Application

#### 1.1 Project Structure Setup
- [ ] Create `src/` directory with main modules
- [ ] Set up `requirements.txt` with dependencies:
  - `notion-client` - Notion API integration
  - `jinja2` - HTML template engine
  - `weasyprint` - PDF generation
  - `python-dotenv` - Environment variables
- [ ] Create `.env.example` for configuration template

#### 1.2 Notion Integration (`src/notion_client.py`)
- [ ] Implement Notion API client
- [ ] Create function to query "Acessorios" table
- [ ] Filter products where `Catálogo Ativo == true`
- [ ] Extract required fields: Nome, Preço, Imagem, SKU, Barcode
- [ ] Handle image URL processing (external/file URLs)
- [ ] Add error handling for API failures

#### 1.3 PDF Generation Engine (`src/catalog_generator.py`)
- [ ] Implement WeasyPrint PDF generation
- [ ] Create HTML template with Jinja2
- [ ] Design 2-column product grid layout
- [ ] Add CSS styling for professional appearance
- [ ] Implement Brazilian Real (R$) price formatting
- [ ] Handle missing images with fallback

#### 1.4 Main Application (`src/main.py`)
- [ ] Build CLI interface for catalog generation
- [ ] Add comprehensive error handling and logging
- [ ] Create automatic output directory management
- [ ] Add progress indicators for large catalogs
- [ ] Implement file naming conventions (date/time stamps)

### Phase 2: Template & Styling

#### 2.1 Professional Template Design
- [ ] Create responsive HTML structure for product cards
- [ ] Implement CSS styling with company branding
- [ ] Add image handling with fallback for missing images
- [ ] Format prices with Brazilian locale (R$ 99,90)
- [ ] Ensure print-friendly layout optimization

#### 2.2 Configuration Management
- [ ] Environment variables for Notion API token and database ID
- [ ] Configurable output paths and file naming patterns
- [ ] Template customization options (colors, layout)
- [ ] Add validation for required environment variables

### Phase 3: Integration & Enhancement

#### 3.1 Dual Solution Support
- [ ] Maintain compatibility with existing n8n flow
- [ ] Ensure consistent output format between approaches
- [ ] Document differences and use cases for each solution

#### 3.2 Testing & Validation
- [ ] Test with actual "Acessorios" table data
- [ ] Validate image loading and PDF generation
- [ ] Error handling for network issues and missing data
- [ ] Performance testing with large product catalogs

## 🛠️ Technical Stack

- **Python 3.10+** - Main programming language
- **notion-client** - Official Notion SDK for Python
- **Jinja2** - Template engine for HTML generation
- **WeasyPrint** - HTML/CSS to PDF converter
- **python-dotenv** - Environment variable management

## ⚙️ Configuration

### Environment Variables (.env)
```bash
NOTION_API_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=20009e6acd3480e19a27f3364f6c209d
OUTPUT_DIR=./output
TEMPLATE_DIR=./templates
```

### Required Notion Integration Setup
1. Create Notion integration at https://www.notion.so/my-integrations
2. Copy integration token to `.env` file
3. Share "Acessorios" database with the integration
4. Ensure integration has read permissions

## 📁 Project Structure
```
JA Distribuidora/
├── CLAUDE.md                    # This documentation
├── problem-solution             # Original problem description
├── requisitos_catalogo_pdf.md   # Requirements specification
├── mini_catalog_flow.json       # n8n flow configuration
├── .env.example                 # Environment template
├── requirements.txt             # Python dependencies
├── src/
│   ├── __init__.py
│   ├── main.py                  # Main CLI application
│   ├── notion_client.py         # Notion API integration
│   ├── catalog_generator.py     # PDF generation logic
│   └── utils.py                 # Helper functions
├── templates/
│   ├── assets/
│   │   └── ja_logo.png         # Company logo for PDF header
│   ├── catalog.html             # Jinja2 HTML template
│   └── styles.css               # CSS styling with brand colors
└── output/                      # Generated PDF files
```

## 🎨 Catalog Layout Design

- **Format**: A4 PDF, portrait orientation
- **Header**: Company logo with brand colors (orange #FF5722 and navy blue)
- **Grid**: 2 products per row
- **Product Card Elements**:
  - Product image (150x150px with fallback)
  - Product name (prominent typography)
  - Price in Brazilian Real format (orange brand color)
  - SKU/Barcode (smaller text)
- **Branding**: JA Distribuidora logo and consistent brand colors throughout
- **Styling**: Clean, professional appearance suitable for WhatsApp sharing

## 🔄 Usage Workflow

### Python Standalone:
1. Configure `.env` with Notion credentials
2. Run `python src/main.py` to generate catalog
3. Find PDF in `output/` directory
4. Share via WhatsApp manually

### n8n Automation:
1. Trigger webhook endpoint
2. Automatic Notion query and PDF generation
3. Receive PDF download URL
4. Optional: Auto-send via WhatsApp Cloud API

## 🚀 Future Enhancements

### Roadmap:
1. **Custom Order Generation** - Select specific products with quantities
2. **Barcode Scanning** - Mobile app integration for product selection
3. **Image Recognition** - Google Vision API for product identification
4. **Sales Analytics** - Track catalog performance and popular products
5. **Dashboard** - Web interface for catalog management
6. **WhatsApp Integration** - Automated sending via Cloud API

### Planned Features:
- Multiple template themes
- Product categories and filtering
- Inventory integration
- Multi-language support
- Batch processing for multiple catalogs

## 📋 Current Status

### Completed:
- [x] Project requirements analysis
- [x] n8n flow structure (PDFMonkey integration)
- [x] Database schema definition
- [x] Technical architecture planning

### Next Steps:
- [ ] Python application development
- [ ] Template design and CSS styling
- [ ] Testing with real data
- [ ] Documentation and setup guides

## 🔧 Usage Commands

### Basic Usage
```bash
# Install dependencies (first time only)
pip install -r requirements.txt

# Generate catalog with default settings
python src/main.py
```

### Advanced Options
```bash
# Generate with custom filename
python src/main.py --filename "meu_catalogo_janeiro.pdf"

# Generate to custom output directory
python src/main.py --output ./meus_catalogos/

# Combine custom filename and directory
python src/main.py --output ./catalogos_2025/ --filename "catalogo_promocional.pdf"

# Enable debug mode with verbose logging
python src/main.py --debug

# Get help with all available options
python src/main.py --help
```

### Command Line Options
- `--output, -o`: Custom output directory for generated PDF
- `--filename, -f`: Custom filename for the generated PDF (auto-adds .pdf extension)
- `--debug, -d`: Enable debug logging for troubleshooting
- `--help, -h`: Show help message with all available options

### Output Files
- Default location: `./output/`
- Default naming: `catalogo_ja_distribuidora_YYYYMMDD_HHMMSS.pdf`
- File format: A4 PDF with company branding and logo

## 📞 Support & Contact

For questions or issues related to this project:
- Check existing documentation in this file
- Review error logs in the application output
- Verify Notion integration permissions and API token

---

*Last updated: 2025-06-25*
*Project: JA Distribuidora Catalog Generation*