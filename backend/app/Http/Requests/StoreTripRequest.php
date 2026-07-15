<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isConducteurValide() ?? false;
    }

    public function rules(): array
    {
        return [
            'ville_depart' => ['required', 'string', 'max:255'],
            'depart_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'depart_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'ville_arrivee' => ['required', 'string', 'max:255'],
            'arrivee_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'arrivee_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'points_arret' => ['nullable', 'array'],
            'points_arret.*' => ['string', 'max:255'],
            'date_heure_depart' => ['required', 'date', 'after:now'],
            'places_totales' => ['required', 'integer', 'min:1', 'max:8'],
            'prix_place' => ['required', 'numeric', 'min:0'],
        ];
    }
}
