<?php

namespace App\Services;

use App\Exceptions\PlacesInsuffisantesException;
use App\Exceptions\ReservationInvalideException;
use App\Models\Reservation;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Centralise le cycle de vie des réservations :
 * En attente → Confirmée → Terminée / Annulée / Refusée
 */
class ReservationService
{
    public function reserver(Trip $trip, User $passager, int $nombrePlaces): Reservation
    {
        return DB::transaction(function () use ($trip, $passager, $nombrePlaces) {
            $trip = Trip::where('id', $trip->id)->lockForUpdate()->first();

            if ($trip->statut->value !== 'publie') {
                throw new ReservationInvalideException("Ce trajet n'est plus disponible à la réservation.");
            }

            if ($trip->places_disponibles < $nombrePlaces) {
                throw new PlacesInsuffisantesException;
            }

            if ($this->chevaucheReservationExistante($passager, $trip)) {
                throw new ReservationInvalideException(
                    "Vous avez déjà une réservation sur un trajet qui chevauche cet horaire."
                );
            }

            $reservation = Reservation::create([
                'trip_id' => $trip->id,
                'passenger_id' => $passager->id,
                'nombre_places' => $nombrePlaces,
                'statut' => 'en_attente',
            ]);

            $this->historiser($reservation, null, 'en_attente', $passager);

            return $reservation;
        });
    }

    public function accepter(Reservation $reservation, User $acteur): Reservation
    {
        return DB::transaction(function () use ($reservation, $acteur) {
            $reservation = Reservation::where('id', $reservation->id)->lockForUpdate()->first();
            $trip = Trip::where('id', $reservation->trip_id)->lockForUpdate()->first();

            if ($reservation->statut->value !== 'en_attente') {
                throw new ReservationInvalideException("Cette réservation ne peut plus être acceptée.");
            }

            if ($trip->places_disponibles < $reservation->nombre_places) {
                throw new PlacesInsuffisantesException;
            }

            $trip->decrement('places_disponibles', $reservation->nombre_places);
            $ancien = $reservation->statut->value;
            $reservation->update(['statut' => 'confirmee']);

            $this->historiser($reservation, $ancien, 'confirmee', $acteur);

            return $reservation->fresh();
        });
    }

    public function refuser(Reservation $reservation, User $acteur): Reservation
    {
        if ($reservation->statut->value !== 'en_attente') {
            throw new ReservationInvalideException("Cette réservation ne peut plus être refusée.");
        }

        $ancien = $reservation->statut->value;
        $reservation->update(['statut' => 'refusee']);
        $this->historiser($reservation, $ancien, 'refusee', $acteur);

        return $reservation->fresh();
    }

    public function annuler(Reservation $reservation, User $acteur): Reservation
    {
        return DB::transaction(function () use ($reservation, $acteur) {
            $reservation = Reservation::where('id', $reservation->id)->lockForUpdate()->first();

            if (! in_array($reservation->statut->value, ['en_attente', 'confirmee'], true)) {
                throw new ReservationInvalideException("Cette réservation ne peut plus être annulée.");
            }

            $etaitConfirmee = $reservation->statut->value === 'confirmee';
            $ancien = $reservation->statut->value;

            $reservation->update(['statut' => 'annulee']);

            if ($etaitConfirmee) {
                Trip::where('id', $reservation->trip_id)
                    ->increment('places_disponibles', $reservation->nombre_places);
            }

            $this->historiser($reservation, $ancien, 'annulee', $acteur);

            return $reservation->fresh();
        });
    }

    private function chevaucheReservationExistante(User $passager, Trip $trip): bool
    {
        $margeHeures = 2;
        $debut = $trip->date_heure_depart->copy()->subHours($margeHeures);
        $fin = $trip->date_heure_depart->copy()->addHours($margeHeures);

        return Reservation::where('passenger_id', $passager->id)
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->whereHas('trip', function ($q) use ($debut, $fin) {
                $q->whereBetween('date_heure_depart', [$debut, $fin]);
            })
            ->exists();
    }

    private function historiser(Reservation $reservation, ?string $de, string $vers, User $acteur): void
    {
        $reservation->transitions()->create([
            'de_statut' => $de,
            'vers_statut' => $vers,
            'acteur_id' => $acteur->id,
        ]);
    }
}
