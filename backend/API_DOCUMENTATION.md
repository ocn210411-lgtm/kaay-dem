# Kaay Dem ! — Documentation API v1

Base URL : `http://localhost:8000/api/v1`
Authentification : Bearer Token (Laravel Sanctum) — header `Authorization: Bearer {token}`

## Comptes de test (après `php artisan db:seed`)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@kaaydem.test | password |
| Conducteur | conducteur@kaaydem.test | password |
| Passager | passager@kaaydem.test | password |

## Authentification

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | non | Inscription (nom, email, password, password_confirmation, telephone?, campus?) |
| POST | `/login` | non | Connexion (email, password) → token |
| POST | `/logout` | oui | Révoque le token courant |
| GET | `/me` | oui | Profil de l'utilisateur connecté |
| PUT/POST | `/me` | oui | Mise à jour du profil (photo en multipart via POST) |

## Conducteur

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/driver-requests` | oui | Demande de statut conducteur (permis, véhicule) |

## Trajets

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/trips` | non | Recherche paginée (`ville_depart`, `ville_arrivee`, `date`, `prix_max`, `places_disponibles`, `sort`, `direction`, `per_page`) |
| GET | `/trips/{id}` | non | Détail d'un trajet |
| POST | `/trips` | oui (conducteur validé) | Création d'un trajet |
| PUT | `/trips/{id}` | oui (auteur) | Modification (bloqué si réservation confirmée) |
| DELETE | `/trips/{id}` | oui (auteur) | Annulation (bloqué si réservation confirmée) |
| PATCH | `/trips/{id}/close` | oui (auteur) | Clôture du trajet |
| GET | `/trips/{id}/reservations` | oui (auteur) | Réservations reçues sur ce trajet |

## Réservations

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/trips/{id}/reservations` | oui | Réserver des places (`nombre_places`) |
| GET | `/reservations` | oui | Mes réservations (passager) |
| PATCH | `/reservations/{id}/accept` | oui (conducteur) | Accepter |
| PATCH | `/reservations/{id}/refuse` | oui (conducteur) | Refuser |
| PATCH | `/reservations/{id}/cancel` | oui (passager) | Annuler |
| POST | `/reservations/{id}/review` | oui (passager) | Évaluer après trajet terminé (`note` 1-5, `commentaire?`) |

## Signalements

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/reports` | oui | Signaler un utilisateur (`utilisateur_signale_id`, `trip_id?`, `motif`) |

## Tableaux de bord

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/driver` | oui | Mes trajets + réservations en attente + note moyenne |
| GET | `/dashboard/passenger` | oui | Mes réservations |

## Administration (rôle admin)

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | Liste des utilisateurs (`q` recherche) |
| PATCH | `/admin/users/{id}/toggle-active` | Active/désactive un compte |
| GET | `/admin/driver-requests` | Demandes conducteur (`statut`) |
| PATCH | `/admin/driver-requests/{id}/accept` | Valider une demande |
| PATCH | `/admin/driver-requests/{id}/reject` | Rejeter (`motif_rejet?`) |
| GET | `/admin/reports` | Liste des signalements (`statut`) |
| PATCH | `/admin/reports/{id}` | Traiter (`statut`, `resolution?`) |
| GET | `/admin/stats` | Statistiques (trajets/mois, taux d'occupation, top conducteurs, totaux) |

## Codes d'erreur normalisés

| Code | Cas |
|---|---|
| 401 | Non authentifié |
| 403 | Action non autorisée (policy) |
| 404 | Ressource introuvable |
| 409 | Places insuffisantes / transition de réservation invalide |
| 422 | Validation échouée (détail dans `errors`) |
