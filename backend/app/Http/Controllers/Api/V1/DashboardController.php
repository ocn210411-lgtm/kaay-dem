<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReservationResource;
use App\Http\Resources\TripResource;
use App\Models\Reservation;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Tableau de bord conducteur : mes trajets publiés.
     */
    public function driver(Request $request)
    {
        $user = $request->user();

        $trips = $user->tripsAsDriver()
            ->withCount('reservations')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'trips' => TripResource::collection($trips),
            'note_moyenne' => $user->noteMoyenneConducteur(),
        ]);
    }

    /**
     * Réservations reçues par le conducteur sur l'ensemble de ses trajets
     * (tous statuts confondus) — onglet "Reçues" de la page Mes réservations.
     */
    public function receivedReservations(Request $request)
    {
        $user = $request->user();

        $reservations = Reservation::whereHas(
            'trip',
            fn ($q) => $q->where('driver_id', $user->id)
        )
            ->with('trip', 'passenger')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ReservationResource::collection($reservations);
    }

    /**
     * Tableau de bord passager : mes réservations envoyées.
     */
    public function passenger(Request $request)
    {
        $reservations = $request->user()
            ->reservations()
            ->with('trip.driver.driverProfile', 'review')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ReservationResource::collection($reservations);
    }
}
