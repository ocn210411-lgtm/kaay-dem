<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReviewPolicy
{
    public function create(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->passenger_id
            && $reservation->statut->value === 'terminee'
            && ! $reservation->review()->exists();
    }
}
