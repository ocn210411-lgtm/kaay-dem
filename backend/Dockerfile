# Image de production pour l'API Laravel — pensée pour le tiers gratuit de
# Render (Web Service Docker). Utilise le serveur intégré `php artisan serve`
# plutôt que nginx+php-fpm : suffisant pour la charge d'un projet étudiant, et
# ça évite d'avoir à maintenir une config nginx séparée pour un simple déploiement gratuit.
FROM php:8.3-cli-alpine

# Dépendances système + extensions PHP nécessaires à Laravel et aux deux
# moteurs de base de données supportés (MySQL en local, PostgreSQL sur Render).
RUN apk add --no-cache \
        postgresql-dev \
        libzip-dev \
        oniguruma-dev \
        curl \
    && docker-php-ext-install \
        pdo_mysql \
        pdo_pgsql \
        mbstring \
        bcmath \
        zip \
        exif \
        pcntl

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Les dépendances d'abord (couche mise en cache tant que composer.json ne change pas)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize \
    && chmod +x docker-entrypoint.sh

# Storage/bootstrap-cache doivent rester inscriptibles (uploads, cache de vues, etc.)
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
