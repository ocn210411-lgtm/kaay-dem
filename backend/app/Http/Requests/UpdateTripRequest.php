<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // vérifié par TripPolicy::update dans le contrôleur
    }

    public function rules(): array
    {
        return [
            'ville_depart' => ['sometimes', 'string', 'max:255'],
            'depart_lat' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'depart_lng' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'ville_arrivee' => ['sometimes', 'string', 'max:255'],
            'arrivee_lat' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'arrivee_lng' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'points_arret' => ['sometimes', 'nullable', 'array'],
            'points_arret.*' => ['string', 'max:255'],
            'date_heure_depart' => ['sometimes', 'date', 'after:now'],
            'places_totales' => ['sometimes', 'integer', 'min:1', 'max:8'],
            'prix_place' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
