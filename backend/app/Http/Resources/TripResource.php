<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'driver' => new UserResource($this->whenLoaded('driver')),
            'ville_depart' => $this->ville_depart,
            'depart_lat' => $this->depart_lat !== null ? (float) $this->depart_lat : null,
            'depart_lng' => $this->depart_lng !== null ? (float) $this->depart_lng : null,
            'ville_arrivee' => $this->ville_arrivee,
            'arrivee_lat' => $this->arrivee_lat !== null ? (float) $this->arrivee_lat : null,
            'arrivee_lng' => $this->arrivee_lng !== null ? (float) $this->arrivee_lng : null,
            'points_arret' => $this->points_arret ?? [],
            'date_heure_depart' => $this->date_heure_depart,
            'places_totales' => $this->places_totales,
            'places_disponibles' => $this->places_disponibles,
            'prix_place' => (float) $this->prix_place,
            'statut' => $this->statut,
            'reservations_count' => $this->whenCounted('reservations'),
            'created_at' => $this->created_at,
        ];
    }
}
