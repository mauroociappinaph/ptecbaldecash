# Deployment Guide

This guide provides comprehensive instructions for deploying the User Management System to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Development Deployment](#development-deployment)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Security Checklist](#security-checklist)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Backend Requirements:**

- PHP 8.2 or higher
- Composer 2.0+
- MySQL 8.0+ or PostgreSQL 13+
- Web server (Apache 2.4+ or Nginx 1.18+)
- SSL certificate (production)

**Frontend Requirements:**

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Modern web browser support

**Server Requirements:**

- Minimum 2GB RAM
- 10GB disk space
- HTTPS support
- Cron job support

## Environment Configuration

### Backend Environment Variables

Create environment-specific `.env` files based on `.env.example`:

#### Development (.env)

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
MAIL_MAILER=log
```

#### Staging (.env.staging)

```env
APP_ENV=staging
APP_DEBUG=true
APP_URL=https://staging-api.yourdomain.com
DB_CONNECTION=mysql
DB_HOST=staging-db-host
MAIL_MAILER=smtp
```

#### Production (.env.production)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
DB_CONNECTION=mysql
DB_HOST=production-db-host
MAIL_MAILER=smtp
SESSION_SECURE_COOKIE=true
```

### Frontend Environment Variables

#### Development (.env)

```env
NODE_ENV=development
NUXT_PUBLIC_API_BASE=http://localhost:8000/api
NUXT_DEVTOOLS_ENABLED=true
```

#### Staging (.env.staging)

```env
NODE_ENV=staging
NUXT_PUBLIC_API_BASE=https://staging-api.yourdomain.com/api
NUXT_DEVTOOLS_ENABLED=false
```

#### Production (.env.production)

```env
NODE_ENV=production
NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
NUXT_DEVTOOLS_ENABLED=false
NUXT_PUBLIC_ENABLE_DEBUG_LOGGING=false
```

## Development Deployment

### Local Development Setup

1. **Clone Repository:**

   ```bash
   git clone <repository-url>
   cd user-management-system
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   php artisan serve
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

### Development with Docker

```bash
# Build and start containers
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
docker-compose exec backend php artisan migrate

# Seed database
docker-compose exec backend php artisan db:seed
```

## Staging Deployment

### Server Setup

1. **Install Dependencies:**

   ```bash
   # PHP and extensions
   sudo apt update
   sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip

   # Composer
   curl -sS https://getcomposer.org/installer | php
   sudo mv composer.phar /usr/local/bin/composer

   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install nodejs
   ```

2. **Database Setup:**

   ```bash
   # MySQL
   sudo apt install mysql-server
   sudo mysql_secure_installation

   # Create database
   mysql -u root -p
   CREATE DATABASE user_management_staging;
   CREATE USER 'staging_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON user_management_staging.* TO 'staging_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Backend Deployment

```bash
# Clone and setup
git clone <repository-url> /var/www/user-management-staging
cd /var/www/user-management-staging/backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Environment configuration
cp .env.example .env.staging
# Edit .env.staging with staging values
ln -sf .env.staging .env

# Generate key and run migrations
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data /var/www/user-management-staging
sudo chmod -R 755 /var/www/user-management-staging
sudo chmod -R 775 /var/www/user-management-staging/backend/storage
sudo chmod -R 775 /var/www/user-management-staging/backend/bootstrap/cache
```

### Frontend Deployment

```bash
cd /var/www/user-management-staging/frontend

# Install dependencies
npm ci

# Environment configuration
cp .env.example .env.staging
# Edit .env.staging with staging values
ln -sf .env.staging .env

# Build for production
npm run build

# The .output directory contains the built application
```

### Web Server Configuration

#### Nginx Configuration

Create `/etc/nginx/sites-available/user-management-staging`:

```nginx
# Backend API
server {
    listen 80;
    server_name staging-api.yourdomain.com;
    root /var/www/user-management-staging/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}

# Frontend
server {
    listen 80;
    server_name staging.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/user-management-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Process Management

Create systemd service for the frontend:

`/etc/systemd/system/user-management-frontend-staging.service`:

```ini
[Unit]
Description=User Management Frontend (Staging)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/user-management-staging/frontend
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=always
RestartSec=10
Environment=NODE_ENV=staging
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable user-management-frontend-staging
sudo systemctl start user-management-frontend-staging
```

## Production Deployment

### SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificates
sudo certbot --nginx -d api.yourdomain.com -d yourdomain.com
```

### Production Nginx Configuration

Update Nginx configuration to include SSL:

```nginx
# Backend API with SSL
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    root /var/www/user-management-production/backend/public;
    index index.php;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}

# Frontend with SSL
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Database Backup Setup

Create backup script `/usr/local/bin/backup-user-management.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/user-management"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="user_management_production"
DB_USER="production_user"
DB_PASS="your_secure_password"

mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.sql.gz"
```

Add to crontab:

```bash
sudo crontab -e
# Add this line for daily backups at 2 AM
0 2 * * * /usr/local/bin/backup-user-management.sh
```

## Docker Deployment

### Docker Compose Configuration

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - APP_ENV=production
      - DB_HOST=database
    depends_on:
      - database
    volumes:
      - ./backend/storage:/var/www/html/storage
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NUXT_PUBLIC_API_BASE=https://api.yourdomain.com/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - app-network

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - backend
      - frontend
    networks:
      - app-network

volumes:
  mysql_data:

networks:
  app-network:
    driver: bridge
```

### Backend Dockerfile

Create `backend/Dockerfile.prod`:

```dockerfile
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Expose port
EXPOSE 9000

CMD ["php-fpm"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile.prod`:

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", ".output/server/index.mjs"]
```

## Security Checklist

### Pre-Deployment Security

- [ ] All secrets stored in environment variables
- [ ] Database credentials are secure and unique
- [ ] SSL certificates are valid and properly configured
- [ ] CORS settings are restrictive
- [ ] Rate limiting is enabled
- [ ] Input validation is comprehensive
- [ ] Error messages don't expose sensitive information
- [ ] File permissions are properly set
- [ ] Debug mode is disabled in production

### Post-Deployment Security

- [ ] Regular security updates applied
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested
- [ ] Access logs are monitored
- [ ] Intrusion detection is active
- [ ] Regular security audits performed

## Monitoring and Maintenance

### Log Management

Configure log rotation in `/etc/logrotate.d/user-management`:

```
/var/www/user-management-*/backend/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### Health Checks

Create health check endpoints:

**Backend Health Check** (`routes/web.php`):

```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected'
    ]);
});
```

**Frontend Health Check** (`server/api/health.get.ts`):

```typescript
export default defineEventHandler(async (event) => {
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.NUXT_PUBLIC_APP_VERSION || "1.0.0",
  };
});
```

### Monitoring Setup

Configure monitoring with tools like:

- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Application Monitoring**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Log Analysis**: ELK Stack, Splunk

## Troubleshooting

### Common Deployment Issues

1. **Permission Errors:**

   ```bash
   sudo chown -R www-data:www-data /var/www/user-management-*
   sudo chmod -R 775 storage bootstrap/cache
   ```

2. **Database Connection Issues:**

   - Check database credentials in `.env`
   - Verify database server is running
   - Test connection: `php artisan tinker` then `DB::connection()->getPdo()`

3. **SSL Certificate Issues:**

   ```bash
   sudo certbot renew --dry-run
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Frontend Build Issues:**
   ```bash
   rm -rf node_modules .nuxt .output
   npm install
   npm run build
   ```

### Performance Optimization

1. **Backend Optimization:**

   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan optimize
   ```

2. **Database Optimization:**

   - Add proper indexes
   - Optimize queries
   - Configure query caching

3. **Frontend Optimization:**
   - Enable compression (gzip/brotli)
   - Configure CDN
   - Optimize images and assets

### Rollback Procedures

1. **Database Rollback:**

   ```bash
   php artisan migrate:rollback --step=1
   ```

2. **Application Rollback:**

   ```bash
   git checkout previous-stable-tag
   composer install --no-dev
   npm ci && npm run build
   ```

3. **Full System Rollback:**
   - Restore database from backup
   - Deploy previous application version
   - Update DNS if necessary

## Support and Maintenance

### Regular Maintenance Tasks

- **Daily**: Monitor logs and system health
- **Weekly**: Review security alerts and updates
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Full security audit and backup testing

### Emergency Procedures

1. **System Down:**

   - Check server status and resources
   - Review error logs
   - Verify database connectivity
   - Check SSL certificate validity

2. **Security Incident:**

   - Isolate affected systems
   - Review access logs
   - Update credentials
   - Apply security patches

3. **Data Loss:**
   - Stop all write operations
   - Restore from latest backup
   - Verify data integrity
   - Resume operations

For additional support, refer to the main [README.md](README.md) and [API documentation](API.md).
