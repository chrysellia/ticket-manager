# syntax=docker/dockerfile:1

# -------- Composer stage --------
FROM composer:2 AS composer_deps
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-scripts --no-progress --no-interaction

# -------- Node build stage (assets) --------
FROM node:20-alpine AS assets_builder
WORKDIR /app
# Copy package manifests first for caching
COPY package.json package-lock.json ./
# Bring vendor from composer stage to satisfy local file deps (e.g. @symfony/ux-turbo)
COPY --from=composer_deps /app/vendor ./vendor
# Install node deps
RUN npm ci --no-audit --no-fund
# Copy the rest needed for build (webpack config and sources)
COPY webpack.config.js ./
COPY assets ./assets
COPY postcss.config.mjs ./
COPY tsconfig.json ./
# Build assets to /app/public/build
RUN npm run build

# -------- Runtime stage --------
FROM php:8.2-apache

# Install system deps and PHP extensions (PostgreSQL)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git unzip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules and configure vhost
RUN a2enmod rewrite expires headers && rm -f /etc/apache2/sites-enabled/000-default.conf
COPY docker/apache.conf /etc/apache2/sites-available/000-symfony.conf
RUN a2ensite 000-symfony.conf

# Set working dir and copy app
WORKDIR /var/www/html
# Copy app source
COPY . ./
# Copy vendor from composer stage
COPY --from=composer_deps /app/vendor ./vendor
# Copy built assets from node stage
COPY --from=assets_builder /app/public/build ./public/build

# Set correct permissions for cache/logs (production)
RUN chown -R www-data:www-data var \
    && mkdir -p var/cache var/log \
    && chown -R www-data:www-data var/cache var/log

# Production env vars (can be overridden by Render)
ENV APP_ENV=prod \
    COMPOSER_ALLOW_SUPERUSER=1

# Optimize autoloader and dump env (no secrets in repo)
RUN php -d detect_unicode=0 -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && rm composer-setup.php \
    && composer dump-autoload --optimize \
    && if [ -f .env ]; then composer dump-env prod; fi

# Entrypoint runs migrations then starts Apache
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port expected by Render
EXPOSE 8080
# Apache default is 80; actual listen port will be set at runtime by entrypoint using $PORT (Render provides this)

ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]
