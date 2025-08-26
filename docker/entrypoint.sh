#!/usr/bin/env sh
set -e

# Ensure cache and logs directories are writable
mkdir -p var/cache var/log
chown -R www-data:www-data var || true

# Run database migrations if DATABASE_URL is present
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  php bin/console doctrine:migrations:migrate --no-interaction || true
fi

# Warm up Symfony cache
APP_ENV=${APP_ENV:-prod}
echo "Warming up cache for APP_ENV=$APP_ENV"
php bin/console cache:clear --no-warmup || true
php bin/console cache:warmup || true

# Configure Apache listen port based on $PORT (Render provides this)
if [ -n "$PORT" ]; then
  echo "Configuring Apache to listen on PORT=$PORT"
  if [ -f /etc/apache2/ports.conf ]; then
    sed -ri "s/^Listen\s+[0-9]+/Listen ${PORT}/" /etc/apache2/ports.conf || true
  fi
  if [ -f /etc/apache2/sites-available/000-symfony.conf ]; then
    sed -ri "s#<VirtualHost \*:[0-9]+>#<VirtualHost *:${PORT}>#" /etc/apache2/sites-available/000-symfony.conf || true
  fi
fi

# Start Apache in foreground
exec "$@"
