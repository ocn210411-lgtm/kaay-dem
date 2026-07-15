# Kaay Dem ! — Plateforme de covoiturage étudiant

Projet réalisé dans le cadre de l'examen ISEP Diamniadio « Développement web full-stack ».
Plateforme de covoiturage réservée à la communauté étudiante (Dakar · Rufisque · Diamniadio) :
les conducteurs publient des trajets, les passagers réservent des places, et chacun évalue
l'autre après le voyage.

## Stack technique

| Côté | Techno |
|---|---|
| Backend | Laravel 11, Sanctum (auth par tokens), policies, API Resources, Form Requests |
| Frontend | React 18 (Vite) + TypeScript, React Router, TanStack Query, Zustand, Tailwind CSS v4, shadcn/ui |
| Base de données | MySQL 8 |
| Design | Palette et typographie sur-mesure (« Crépuscule sur la Corniche »), composants shadcn/ui |

## Structure du dépôt

```
kaay-dem/
├── backend/     Laravel 11 — API REST /api/v1
└── frontend/    React (Vite) — SPA consommant l'API
```

## Comptes de test (après le seeding)

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Admin | admin@kaaydem.test | password |
| Conducteur | conducteur@kaaydem.test | password |
| Passager | passager@kaaydem.test | password |

(Tous les autres utilisateurs générés par les factories utilisent aussi le mot de passe `password`.)

## Installation — Backend (Laravel)

Prérequis : PHP 8.2+, Composer, MySQL 8 (ou compatible).

```bash
cd backend
cp .env.example .env
composer install

# Configurer .env : DB_DATABASE, DB_USERNAME, DB_PASSWORD selon votre serveur MySQL
# (valeurs par défaut prêtes pour un serveur MAMP local : port 8889, user root/root)

php artisan key:generate
php artisan migrate --seed   # crée les tables + données de démonstration
php artisan serve            # démarre l'API sur http://127.0.0.1:8000
```

> **Important — limites d'upload PHP** : le dossier conducteur (permis recto/verso,
> carte grise, assurance, photo du véhicule) envoie jusqu'à 5 photos en une seule
> requête. Des photos prises directement avec l'appareil d'un smartphone pèsent
> couramment 5 à 10 Mo chacune. Le `php.ini` par défaut (souvent `post_max_size = 8M`)
> est trop restrictif et fait échouer silencieusement l'envoi avec un message
> générique « Les données fournies sont invalides. ». Sur un nouvel environnement,
> vérifier/ajuster dans `php.ini` :
> ```ini
> post_max_size = 70M
> upload_max_filesize = 32M
> ```
> puis redémarrer `php artisan serve`. (Ce réglage est au niveau de la machine,
> pas du dépôt — à refaire si vous changez d'environnement PHP/MAMP.)

La documentation complète des endpoints est dans [`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md).

## Installation — Frontend (React)

Prérequis : Node.js 18+.

```bash
cd frontend
npm install
npm run dev    # démarre la SPA sur http://localhost:5173
```

Le frontend proxie automatiquement `/api` et `/storage` vers `http://127.0.0.1:8000`
(voir `vite.config.ts`) — aucune configuration CORS manuelle n'est nécessaire en développement.

## Fonctionnalités bonus implémentées

- **Carte interactive des trajets** (Leaflet + OpenStreetMap, sans clé API) sur la page de détail
  d'un trajet, avec repères départ/arrêts/arrivée et tracé aux couleurs de la marque. Couvre les
  villes du corridor Dakar–Rufisque–Diamniadio (table de coordonnées dans
  `frontend/src/lib/cityCoordinates.ts`, extensible pour d'autres localités).
- **Localisation GPS exacte du départ/arrivée** : lors de la publication d'un trajet, le conducteur
  peut chercher une adresse (géocodage Nominatim/OpenStreetMap, gratuit) ou cliquer directement sur
  une carte pour fixer le point précis de prise en charge et de dépose
  (`frontend/src/components/LocationPicker.tsx`, colonnes `depart_lat/lng`, `arrivee_lat/lng` sur
  `trips`). Sur la page de détail, le passager voit ce point exact sur la carte et dispose d'un
  bouton « Itinéraire » qui ouvre Google Maps avec la navigation vers ce point précis.
- **Dossier de vérification conducteur complet** : demande de statut conducteur enrichie avec
  numéro et date d'expiration du permis, photos du permis recto/verso, carte grise et attestation
  d'assurance (upload avec aperçu). Les documents ne sont visibles que par le conducteur concerné
  et les administrateurs (`DriverProfileResource`), qui peuvent les consulter en pleine résolution
  avant de valider ou rejeter une demande (`/admin/driver-requests`).
- **Fiche véhicule visible par le passager** : couleur et photo du véhicule s'ajoutent à la
  marque/modèle/immatriculation déjà présents. Contrairement aux documents ci-dessus, ces
  informations sont publiques et affichées sur la page de détail d'un trajet, pour que le
  passager reconnaisse le véhicule et vérifie la plaque avant d'y monter.
- **Signalement d'abus** (bouton « Signaler ») : accessible depuis le détail d'un trajet et les
  tableaux de bord passager/conducteur, avec catégorie + description. Auparavant aucune interface
  ne permettait de créer un signalement ; seule la page admin de traitement existait.
- **Tableau de bord statistiques avancé** : KPI avec tendance vs mois précédent (utilisateurs,
  trajets, réservations, revenu estimé), courbe de croissance des utilisateurs, revenus par mois,
  répartition des réservations par statut (donut), villes de départ les plus populaires, taux
  d'annulation, top conducteurs et flux d'activité récente.

## Fonctionnalités implémentées

- **EF-01/02 — Authentification** : inscription, connexion, déconnexion via Sanctum ; profil
  modifiable (photo, téléphone, campus) ; demande de statut conducteur avec validation admin.
  Une fois un dossier conducteur créé (en attente, validé, ou même rejeté), l'onglet
  « Conducteur » du profil devient un formulaire d'édition complet (permis, véhicule,
  documents) — modifier le véhicule seul (marque/modèle/couleur/immatriculation/photo)
  n'affecte pas la validation en cours, mais modifier le permis ou l'un des documents
  d'identité remet le dossier « en attente » pour qu'un administrateur le revérifie.
- **EF-03/04 — Trajets** : CRUD complet, recherche publique paginée et filtrée (ville, date, prix,
  places), verrouillage de la modification/suppression dès qu'une réservation est confirmée.
- **EF-05/06 — Réservations** : cycle de vie complet (`En attente → Confirmée → Terminée /
  Annulée / Refusée`), décrémentation atomique des places, interdiction des réservations
  chevauchantes, historisation de chaque transition.
- **EF-07 — Évaluations** : notation 1-5 étoiles + commentaire après un trajet terminé, note
  moyenne affichée sur le profil conducteur.
- **EF-08 — Tableaux de bord** : conducteur (« Mes trajets » : publication, clôture, annulation),
  admin (statistiques avancées avec graphiques, top conducteurs, taux d'occupation). Un écran
  unique « Mes réservations » regroupe les réservations reçues par un conducteur sur ses propres
  trajets (onglet **Reçues**, avec Accepter/Refuser) et les réservations envoyées en tant que
  passager (onglet **Envoyées**, avec annulation et évaluation) — l'onglet Reçues n'apparaît que
  pour les comptes conducteurs validés, les autres utilisateurs voient directement leurs
  réservations envoyées.
- **EF-09 — Administration** : gestion des utilisateurs, validation des conducteurs (le rejet exige
  la saisie d'un motif, transmis et affiché au conducteur sur son profil), traitement des
  signalements. Les documents/photos de vérification (permis, carte grise, assurance, véhicule)
  s'ouvrent en grand directement sur la même page (lightbox), aussi bien côté admin que côté
  passager consultant la photo du véhicule sur le détail d'un trajet.

## Design

Direction visuelle documentée dans le code (`frontend/src/index.css`) : palette « Crépuscule sur
la Corniche » (indigo profond, ambre, corail) et motif signature de « ligne de trajet » (route-line)
réutilisé du hero jusqu'au stepper de statut de réservation, en écho direct au sujet du produit
(trajets partagés entre étudiants, où que ce soit à Dakar et ses environs).

### Responsive / mobile

L'app est pensée mobile-first, pas seulement adaptée après coup :
- **Navigation** : sur mobile, « Mes trajets » et « Mes réservations » (masqués de la barre
  principale faute de place) restent accessibles depuis le menu du compte.
- **Listes admin** : la table « Utilisateurs » devient une liste de cartes en dessous de `sm`
  (nom, e-mail et action complets, sans troncature ni défilement horizontal caché) ; les onglets
  d'administration défilables affichent un dégradé de bord pour indiquer qu'il y a plus de contenu.
- **Textes longs** : les noms de lieux (`RouteLine`, animation du hero) se tronquent proprement
  avec une ellipse plutôt que de faire déborder une carte — testé avec des trajets réels comme
  « Keur Massar → Isep Diamniadio ».
- **Formulaires** : les champs à deux colonnes (dossier conducteur, nouveau trajet) repassent à une
  seule colonne en dessous de `sm` pour éviter le texte tassé/tronqué.
- **Détails techniques** : `touch-action: manipulation` sur les éléments interactifs (pas de délai
  de zoom au double-tap), `overscroll-behavior: contain` + hauteur maximale sur toutes les
  fenêtres modales, `env(safe-area-inset-top)` sur la barre de navigation collante, et
  `overflow-x: hidden` en filet de sécurité contre tout débordement horizontal résiduel.

La photo de fond du hero (`frontend/src/assets/jumbo-hero*.jpg`) illustre une route côtière au
coucher de soleil, en écho direct à la palette « Crépuscule sur la Corniche » et au sujet du
produit (route, trajet, voiture).

## Tests manuels rapides

1. Démarrer backend (`php artisan serve`) et frontend (`npm run dev`).
2. Se connecter avec `passager@kaaydem.test` / `password`, réserver un trajet publié.
3. Se connecter avec `conducteur@kaaydem.test` / `password`, accepter la réservation depuis
   « Mes réservations » → onglet **Reçues**.
4. Se connecter avec `admin@kaaydem.test` / `password`, consulter `/admin/stats`.

## Déploiement gratuit (GitHub + Render)

Le dépôt inclut un Blueprint Render (`render.yaml`) qui provisionne les 3 services gratuits
nécessaires en un clic : l'API Laravel (Docker), le frontend React (site statique) et une base
PostgreSQL.

### Pourquoi PostgreSQL et pas MySQL ?

Le tiers gratuit de Render ne propose pas de MySQL managé — seulement PostgreSQL. Le code est
agnostique du moteur (`config/database.php` définit les deux connexions) ; les rares endroits où
la syntaxe SQL diverge réellement entre les deux bases (formatage de date pour le regroupement par
mois, division entière) sont gérés explicitement dans `StatsController::formatMoisSql()` et
documentés en commentaire. **Testé en conditions réelles sur une vraie base PostgreSQL locale**
(migrations, seeders, recherche de trajets, réservation, statistiques admin) avant d'écrire cette
section — pas seulement supposé fonctionner.

### Étapes

1. **Pousser le code sur GitHub** (déjà fait si tu lis ce fichier depuis le dépôt cloné).
2. Sur [render.com](https://render.com), **New** → **Blueprint** → connecter le dépôt GitHub
   `kaay-dem`. Render détecte automatiquement `render.yaml` et propose de créer les 3 services.
3. Render demande de renseigner `APP_KEY` (volontairement laissée vide dans le Blueprint —
   `generateValue` de Render ne produit pas une clé au bon format pour Laravel). Générer une vraie
   clé en local avec `php artisan key:generate --show` (dans `backend/`) et coller le résultat
   (`base64:...`) dans le champ. **Cette clé ne doit ensuite plus jamais changer** — elle chiffre
   sessions/tokens existants.
4. Valider — Render construit et déploie l'API, le frontend et la base en quelques minutes.
5. Rien d'autre à faire : le seeding se lance **automatiquement** au premier démarrage du backend
   (voir plus bas — le Shell Render, nécessaire pour lancer `php artisan db:seed` à la main, est
   réservé aux instances payantes).

### Limites du tiers gratuit à connaître

- **Pas de Shell ni de "One-Off Jobs"** sur les instances gratuites — impossible de lancer une
  commande Artisan à la main une fois déployé. Contourné avec une commande dédiée,
  `php artisan app:seed-if-empty` (appelée automatiquement par `docker-entrypoint.sh` à chaque
  démarrage) : elle ne seed que si la base est vide, jamais si des données existent déjà — donc
  aucun risque de dupliquer les données de démo à chaque redémarrage/redéploiement.
- **Une seule base PostgreSQL gratuite par compte Render.** Si tu as déjà un autre projet avec une
  base gratuite, il faut la supprimer avant de déployer ce Blueprint (Render refuse d'en créer une
  deuxième et annule la création des autres services en cascade).
- **Disque éphémère** : les fichiers uploadés (photos de profil, documents conducteur) ne
  survivent pas à un redéploiement du service backend. Pour une vraie persistance, brancher soit
  un disque payant Render, soit un stockage externe compatible S3 (ex. Cloudflare R2, gratuit
  jusqu'à un certain volume) sur le disque `public`.
- **Mise en veille** : un service web gratuit s'endort après un moment d'inactivité et met
  ~30-60 secondes à redémarrer au prochain appel — normal, pas un bug.
- **Si Render attribue des noms de service différents** de ceux du Blueprint (`kaay-dem-backend`,
  `kaay-dem-frontend`, en cas de collision de nom), les URLs générées changeront
  (`https://<nom>.onrender.com`). Il faut alors mettre à jour manuellement, dans le dashboard
  Render : `VITE_API_URL` (frontend) ainsi que `APP_URL`, `FRONTEND_URL` et
  `SANCTUM_STATEFUL_DOMAINS` (backend), puis redéployer les deux services.
