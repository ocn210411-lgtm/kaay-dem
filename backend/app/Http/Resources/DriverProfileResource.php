<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        if (! $this->resource) {
            return [];
        }

        // Les documents d'identité/véhicule ne sont visibles que par le
        // conducteur concerné lui-même ou par un administrateur (jamais par
        // les autres utilisateurs qui verraient ce profil, ex. via un trajet).
        $peutVoirDocuments = $request->user()
            && ($request->user()->is_admin || $request->user()->id === $this->user_id);

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'numero_permis' => $this->numero_permis,
            'date_expiration_permis' => $this->when($peutVoirDocuments, $this->date_expiration_permis?->toDateString()),
            'permis_recto' => $this->when($peutVoirDocuments && $this->permis_recto, fn () => asset('storage/'.$this->permis_recto)),
            'permis_verso' => $this->when($peutVoirDocuments && $this->permis_verso, fn () => asset('storage/'.$this->permis_verso)),
            // Contrairement aux documents ci-dessus, ces informations sont publiques :
            // un passager doit pouvoir reconnaître le véhicule avant d'y monter.
            'vehicule' => [
                'marque' => $this->vehicule_marque,
                'modele' => $this->vehicule_modele,
                'couleur' => $this->vehicule_couleur,
                'immatriculation' => $this->vehicule_immatriculation,
                'photo' => $this->vehicule_photo ? asset('storage/'.$this->vehicule_photo) : null,
            ],
            'carte_grise' => $this->when($peutVoirDocuments && $this->carte_grise, fn () => asset('storage/'.$this->carte_grise)),
            'assurance' => $this->when($peutVoirDocuments && $this->assurance, fn () => asset('storage/'.$this->assurance)),
            'statut' => $this->statut,
            'motif_rejet' => $this->motif_rejet,
            'valide_at' => $this->valide_at,
            'created_at' => $this->created_at,
        ];
    }
}
