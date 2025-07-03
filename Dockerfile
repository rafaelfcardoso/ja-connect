# Multi-stage build for JA Distribuidora Catalog System
FROM python:3.11-slim as backend-builder

# Install system dependencies for WeasyPrint
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libfontconfig1 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libxml2 \
    libxslt1.1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY src/ ./src/
COPY templates/ ./templates/
COPY .env.example .env

# Create output directory
RUN mkdir -p /app/output

# Frontend build stage
FROM node:18 as frontend-builder

WORKDIR /app

# Copy package files first
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy frontend source files
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
COPY frontend/index.html ./frontend/
COPY frontend/vite.config.ts ./frontend/
COPY frontend/tsconfig*.json ./frontend/
COPY frontend/tailwind.config.js ./frontend/
COPY frontend/postcss.config.js ./frontend/
COPY frontend/eslint.config.js ./frontend/

# Debug and build
RUN ls -la frontend/src/lib/
RUN cd frontend && npm run build

# Final production stage
FROM python:3.11-slim

# Install runtime dependencies for WeasyPrint
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libfontconfig1 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libxml2 \
    libxslt1.1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python dependencies
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy application code
COPY --from=backend-builder /app/src ./src
COPY --from=backend-builder /app/templates ./templates
COPY --from=backend-builder /app/.env .env

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create directories
RUN mkdir -p /app/output

# Set environment variables
ENV PYTHONPATH=/app
ENV OUTPUT_DIR=/app/output
ENV TEMPLATE_DIR=/app/templates

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start command
CMD ["python", "-m", "uvicorn", "src.api_server:app", "--host", "0.0.0.0", "--port", "8000"]