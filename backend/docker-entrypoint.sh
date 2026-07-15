#!/bin/sh
set -e

# Génère APP_KEY au premier démarrage si absent (Render régénère un conteneur
# neuf à chaque déploiement, mais la variable d'env APP_KEY doit être définie
# une fois pour de bon dans le dashboard Render pour ne jamais changer entre
# les redéploiements — sinon toutes les sessions/tokens existants deviennent invalides).
if [ -z "$APP_KEY" ]; then
    echo "ATTENTION : APP_KEY n'est pas définie. Génère-la une fois avec"
    echo "'php artisan key:generate --show' et enregistre-la dans les variables"
    echo "d'environnement Render (elle ne doit jamais changer après le premier déploiement)."
fi

php artisan config:cache

# Pas de route:cache : la route racine (routes/web.php) utilise une closure,
# et Laravel refuse de mettre en cache toute route dont l'action est une
# closure (erreur "Unable to prepare route for serialization"), ce qui ferait
# planter le conteneur au démarrage. config:cache seul apporte déjà l'essentiel
# du gain de perf pour une API de cette taille.

# --force : évite le prompt de confirmation habituel en environnement non
# interactif (nécessaire, Render exécute ce script sans TTY).
php artisan migrate --force

# Le disque de Render (tiers gratuit) est éphémère : ce lien symbolique est
# recréé à chaque démarrage, mais les fichiers déjà uploadés (photos de
# profil, documents conducteur) ne survivent pas à un redéploiement. Pour une
# persistance réelle, brancher un disque payant Render ou un stockage externe
# (S3-compatible) sur le disque "public" — voir le README.
php artisan storage:link || true

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
