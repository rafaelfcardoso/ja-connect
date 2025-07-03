# VPS Deployment Guide - Hostinger + Docker + Easypanel

## Prerequisites

### Hostinger VPS Requirements
- **Minimum:** VPS Plan 1 (1 vCPU, 4GB RAM, 50GB SSD) - $4.99/month
- **Recommended:** VPS Plan 2 (2 vCPU, 8GB RAM, 100GB SSD) - $8.99/month
- **OS:** Ubuntu 20.04/22.04 LTS

### Domain Setup
- Point your domain to VPS IP
- Configure A record: `jadistribuidora.site` → `VPS_IP`
- Optional: Configure CNAME record: `www.jadistribuidora.site` → `jadistribuidora.site`

## Step 1: VPS Initial Setup

```bash
# Connect to VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Create application user
adduser ja-app
usermod -aG docker ja-app
su - ja-app
```

## Step 2: Easypanel Installation

```bash
# Install Easypanel (as root)
curl -sSL https://get.easypanel.io | sh

# Access Easypanel at: http://your-vps-ip:3000
# Create admin account
# Configure SSL certificates
```

## Step 3: Application Deployment

### Option A: Using Easypanel Web Interface

1. **Login to Easypanel** → `http://your-vps-ip:3000`
2. **Create New Project** → "JA Distribuidora"
3. **Add Service** → Choose "Docker Compose"
4. **Upload Files:**
   - `docker-compose.yml`
   - `.env` (with your Notion credentials)
5. **Configure Environment Variables:**
   ```
   NOTION_API_TOKEN=secret_xxxxx
   NOTION_DATABASE_ID=20009e6acd3480e19a27f3364f6c209d
   ```
6. **Deploy** → Monitor logs for successful startup

### Option B: Manual Docker Deployment

```bash
# Clone repository
git clone https://github.com/your-username/ja-distribuidora.git
cd ja-distribuidora

# Configure environment
cp .env.example .env
nano .env  # Add your Notion API token

# Build and deploy
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

## Step 4: Configure Reverse Proxy

### Using Easypanel (Recommended)
1. **Services** → **JA Distribuidora** → **Domains**
2. **Add Domain:** `jadistribuidora.site`
3. **Enable SSL:** Auto-generated Let's Encrypt certificate
4. **Save Configuration**

### Manual Nginx Configuration
```nginx
# /etc/nginx/sites-available/ja-distribuidora
server {
    server_name jadistribuidora.site www.jadistribuidora.site;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
}
```

## Step 5: Verification

### Health Checks
```bash
# API Health
curl http://localhost:8000/api/health

# Container Status
docker ps

# Application Logs
docker-compose logs ja-distribuidora
```

### Test Catalog Generation
1. **Access:** `https://jadistribuidora.site`
2. **Navigate:** Catalog page
3. **Select Products** → Generate PDF
4. **Verify:** PDF downloads successfully

## Maintenance Commands

```bash
# Update application
cd /path/to/ja-distribuidora
git pull origin main
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f --tail=100

# Backup PDFs
docker cp ja-distribuidora-catalog:/app/output ./pdf-backup

# Restart services
docker-compose restart

# Clean up old images
docker system prune -a
```

## Monitoring & Troubleshooting

### Common Issues

**WeasyPrint Dependencies:**
```bash
# If PDF generation fails
docker exec ja-distribuidora-catalog pip list | grep weasyprint
docker exec ja-distribuidora-catalog python -c "import weasyprint; print('OK')"
```

**Notion API Connection:**
```bash
# Test Notion connectivity
docker exec ja-distribuidora-catalog python src/validate_notion.py
```

**Disk Space:**
```bash
# Monitor PDF storage
docker exec ja-distribuidora-catalog du -sh /app/output
df -h
```

### Performance Optimization

**Resource Limits:**
```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
```

**PDF Cleanup:**
```bash
# Automated cleanup (add to crontab)
0 2 * * * docker exec ja-distribuidora-catalog find /app/output -name "*.pdf" -mtime +30 -delete
```

## Security Considerations

```bash
# Firewall setup
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 3000  # Easypanel (restrict to your IP)
ufw enable

# Docker security
# Run containers as non-root user
# Regular security updates
# Monitor logs for suspicious activity
```

## Cost Estimation

**Monthly Costs:**
- Hostinger VPS Plan 2: $8.99
- Domain (optional): $10-15/year
- **Total:** ~$9-10/month

**vs Serverless Alternatives:**
- Vercel Pro: $20/month (if it worked)
- Heroku Dyno: $7/month + $5/month Postgres
- **Savings:** 40-60% cost reduction with full control