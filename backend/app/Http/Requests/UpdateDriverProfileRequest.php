<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDriverProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Mise à jour partielle : un conducteur peut ne changer que la
        // couleur de son véhicule sans re-fournir tous les documents.
        // Les mêmes limites de taille que la demande initiale (cf.
        // DriverRequestRequest) s'appliquent aux nouveaux fichiers envoyés.
        return [
            'numero_permis' => ['sometimes', 'string', 'max:255'],
            'date_expiration_permis' => ['sometimes', 'date', 'after:today'],
            'permis_recto' => ['sometimes', 'nullable', 'image', 'max:10240'],
            'permis_verso' => ['sometimes', 'nullable', 'image', 'max:10240'],
            'vehicule_marque' => ['sometimes', 'string', 'max:255'],
            'vehicule_modele' => ['sometimes', 'string', 'max:255'],
            'vehicule_couleur' => ['sometimes', 'string', 'max:100'],
            'vehicule_immatriculation' => ['sometimes', 'string', 'max:255'],
            'vehicule_photo' => ['sometimes', 'nullable', 'image', 'max:10240'],
            'carte_grise' => ['sometimes', 'nullable', 'image', 'max:10240'],
            'assurance' => ['sometimes', 'nullable', 'image', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'date_expiration_permis.after' => "Le permis doit être encore valide (date d'expiration future).",
            'permis_recto.max' => 'La photo recto du permis est trop volumineuse (10 Mo maximum).',
            'permis_verso.max' => 'La photo verso du permis est trop volumineuse (10 Mo maximum).',
            'vehicule_photo.max' => 'La photo du véhicule est trop volumineuse (10 Mo maximum).',
            'carte_grise.max' => 'La photo de la carte grise est trop volumineuse (10 Mo maximum).',
            'assurance.max' => "L'attestation d'assurance est trop volumineuse (10 Mo maximum).",
        ];
    }
}
