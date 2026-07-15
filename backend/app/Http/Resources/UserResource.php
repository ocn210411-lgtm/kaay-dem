<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'email' => $this->email,
            'telephone' => $this->telephone,
            'campus' => $this->campus,
            'photo' => $this->photo ? asset('storage/'.$this->photo) : null,
            'is_admin' => $this->is_admin,
            'actif' => $this->actif,
            'est_conducteur_valide' => $this->isConducteurValide(),
            'note_moyenne_conducteur' => $this->when(
                $this->driverProfile()->exists(),
                fn () => $this->noteMoyenneConducteur()
            ),
            'driver_profile' => new DriverProfileResource($this->whenLoaded('driverProfile')),
            'created_at' => $this->created_at,
        ];
    }
}
