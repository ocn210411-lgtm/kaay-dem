<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'trip' => new TripResource($this->whenLoaded('trip')),
            'passenger' => new UserResource($this->whenLoaded('passenger')),
            'nombre_places' => $this->nombre_places,
            'statut' => $this->statut,
            'review' => new ReviewResource($this->whenLoaded('review')),
            'transitions' => ReservationTransitionResource::collection($this->whenLoaded('transitions')),
            'created_at' => $this->created_at,
        ];
    }
}
