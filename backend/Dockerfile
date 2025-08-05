# Use PHP 8.2 with Apache
FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    autoconf \
    g++ \
    make \
    && docker-php-ext-configure zip \
    && docker-php-ext-install pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Configure Apache
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Copy application files
COPY . /var/www/html

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Wait for database to be ready\n\
echo "Waiting for database..."\n\
while ! nc -z database 3306; do\n\
    sleep 1\n\
done\n\
echo "Database is ready!"\n\
\n\
# Generate application key if not exists\n\
if [ ! -f .env ]; then\n\
    cp .env.example .env\n\
fi\n\
\n\
# Generate key if not set\n\
if ! grep -q "APP_KEY=base64:" .env; then\n\
    php artisan key:generate\n\
fi\n\
\n\
# Run migrations\n\
php artisan migrate --force\n\
\n\
# Seed database if empty\n\
if [ "$(php artisan tinker --execute=\"echo App\\Models\\User::count();\")" = "0" ]; then\n\
    php artisan db:seed --force\n\
fi\n\
\n\
# Cache configuration\n\
php artisan config:cache\n\
php artisan route:cache\n\
\n\
# Start Apache\n\
apache2-foreground' > /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh

# Install netcat for database wait script
RUN apt-get update && apt-get install -y netcat-traditional

# Expose port 80
EXPOSE 80

# Start the application
CMD ["/usr/local/bin/start.sh"]
