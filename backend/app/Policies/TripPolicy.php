<?php

namespace App\Policies;

use App\Models\Trip;
use App\Models\User;

class TripPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Trip $trip): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isConducteurValide();
    }

    public function update(User $user, Trip $trip): bool
    {
        return $user->id === $trip->driver_id && ! $trip->aDesReservationsConfirmees();
    }

    public function delete(User $user, Trip $trip): bool
    {
        return $user->id === $trip->driver_id && ! $trip->aDesReservationsConfirmees();
    }

    public function close(User $user, Trip $trip): bool
    {
        return $user->id === $trip->driver_id;
    }
}
