<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['sometimes', 'string', 'max:255'],
            'telephone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'campus' => ['sometimes', 'nullable', 'string', 'max:255'],
            // 2 Mo était trop juste pour une photo de profil prise directement
            // avec l'appareil photo d'un smartphone récent (souvent 3-6 Mo) :
            // relevé à 5 Mo pour éviter un rejet trompeur ("données invalides").
            'photo' => ['sometimes', 'nullable', 'image', 'max:5120'],
            'password' => ['sometimes', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'photo.max' => 'La photo est trop volumineuse (5 Mo maximum).',
        ];
    }
}
