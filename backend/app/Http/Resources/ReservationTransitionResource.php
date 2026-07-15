<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationTransitionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'de_statut' => $this->de_statut,
            'vers_statut' => $this->vers_statut,
            'acteur' => new UserResource($this->whenLoaded('acteur')),
            'created_at' => $this->created_at,
        ];
    }
}
