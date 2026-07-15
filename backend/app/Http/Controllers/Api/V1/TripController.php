<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTripRequest;
use App\Http\Requests\UpdateTripRequest;
use App\Http\Resources\TripResource;
use App\Models\Trip;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $trips = Trip::query()
            ->with('driver.driverProfile')
            ->withCount('reservations')
            ->where('statut', 'publie')
            ->recherche(
                $request->query('ville_depart'),
                $request->query('ville_arrivee'),
                $request->query('date'),
            )
            ->when($request->query('prix_max'), fn ($q, $prix) => $q->where('prix_place', '<=', $prix))
            ->when($request->boolean('places_disponibles'), fn ($q) => $q->where('places_disponibles', '>', 0))
            ->orderBy($request->query('sort', 'date_heure_depart'), $request->query('direction', 'asc'))
            ->paginate($request->integer('per_page', 15));

        return TripResource::collection($trips);
    }

    public function store(StoreTripRequest $request)
    {
        $this->authorize('create', Trip::class);

        $trip = Trip::create([
            ...$request->validated(),
            'driver_id' => $request->user()->id,
            'places_disponibles' => $request->places_totales,
            'statut' => 'publie',
        ]);

        return new TripResource($trip->load('driver.driverProfile'));
    }

    public function show(Trip $trip)
    {
        return new TripResource($trip->load('driver.driverProfile')->loadCount('reservations'));
    }

    public function update(UpdateTripRequest $request, Trip $trip)
    {
        $this->authorize('update', $trip);

        $data = $request->validated();
        if (isset($data['places_totales'])) {
            $diff = $data['places_totales'] - $trip->places_totales;
            $data['places_disponibles'] = max(0, $trip->places_disponibles + $diff);
        }

        $trip->update($data);

        return new TripResource($trip->fresh('driver.driverProfile'));
    }

    public function destroy(Trip $trip)
    {
        $this->authorize('delete', $trip);

        $trip->update(['statut' => 'annule']);
        $trip->delete();

        return response()->json(['message' => 'Trajet annulé.']);
    }

    public function close(Trip $trip)
    {
        $this->authorize('close', $trip);

        $trip->update(['statut' => 'termine']);
        $trip->reservationsActives()->update(['statut' => 'terminee']);

        return new TripResource($trip->fresh('driver.driverProfile'));
    }
}
