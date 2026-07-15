<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Models\Trip;
use App\Services\ReservationService;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function __construct(private ReservationService $reservations)
    {
    }

    public function store(StoreReservationRequest $request, Trip $trip)
    {
        $this->authorize('create', Reservation::class);

        $reservation = $this->reservations->reserver(
            $trip,
            $request->user(),
            $request->integer('nombre_places')
        );

        return new ReservationResource($reservation->load('trip.driver.driverProfile', 'passenger'));
    }

    public function accept(Reservation $reservation, Request $request)
    {
        $this->authorize('respond', $reservation);

        $reservation = $this->reservations->accepter($reservation, $request->user());

        return new ReservationResource($reservation->load('trip.driver.driverProfile', 'passenger'));
    }

    public function refuse(Reservation $reservation, Request $request)
    {
        $this->authorize('respond', $reservation);

        $reservation = $this->reservations->refuser($reservation, $request->user());

        return new ReservationResource($reservation->load('trip.driver.driverProfile', 'passenger'));
    }

    public function cancel(Reservation $reservation, Request $request)
    {
        $this->authorize('cancel', $reservation);

        $reservation = $this->reservations->annuler($reservation, $request->user());

        return new ReservationResource($reservation->load('trip.driver.driverProfile', 'passenger'));
    }

    public function myReservations(Request $request)
    {
        $reservations = $request->user()
            ->reservations()
            ->with('trip.driver.driverProfile', 'review')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ReservationResource::collection($reservations);
    }

    public function tripReservations(Trip $trip, Request $request)
    {
        $this->authorize('update', $trip);

        $reservations = $trip->reservations()
            ->with('passenger')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ReservationResource::collection($reservations);
    }
}
