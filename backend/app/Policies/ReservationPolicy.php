<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    public function view(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->passenger_id
            || $user->id === $reservation->trip->driver_id
            || $user->is_admin;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function cancel(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->passenger_id;
    }

    public function respond(User $user, Reservation $reservation): bool
    {
        // Le conducteur du trajet accepte/refuse la réservation
        return $user->id === $reservation->trip->driver_id;
    }
}
