<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DriverRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // 4 Mo (4096 Ko) était trop restrictif pour des photos prises
        // directement avec l'appareil photo d'un smartphone (souvent 5 à
        // 12 Mo pour un document net et lisible) : chaque envoi réel se
        // faisait rejeter silencieusement avec un message générique
        // "Les données fournies sont invalides.", sans que l'utilisateur
        // comprenne que c'est la taille du fichier qui posait problème.
        // Relevé à 10 Mo (10240 Ko), cohérent avec post_max_size/
        // upload_max_filesize du php.ini (voir README).
        return [
            'numero_permis' => ['required', 'string', 'max:255'],
            'date_expiration_permis' => ['required', 'date', 'after:today'],
            'permis_recto' => ['required', 'image', 'max:10240'],
            'permis_verso' => ['required', 'image', 'max:10240'],
            'vehicule_marque' => ['required', 'string', 'max:255'],
            'vehicule_modele' => ['required', 'string', 'max:255'],
            'vehicule_couleur' => ['required', 'string', 'max:100'],
            'vehicule_immatriculation' => ['required', 'string', 'max:255'],
            'vehicule_photo' => ['required', 'image', 'max:10240'],
            'carte_grise' => ['required', 'image', 'max:10240'],
            'assurance' => ['required', 'image', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'date_expiration_permis.after' => "Le permis doit être encore valide (date d'expiration future).",
            'permis_recto.required' => 'La photo recto du permis est requise.',
            'permis_recto.max' => 'La photo recto du permis est trop volumineuse (10 Mo maximum).',
            'permis_verso.required' => 'La photo verso du permis est requise.',
            'permis_verso.max' => 'La photo verso du permis est trop volumineuse (10 Mo maximum).',
            'vehicule_photo.required' => 'Une photo du véhicule est requise.',
            'vehicule_photo.max' => 'La photo du véhicule est trop volumineuse (10 Mo maximum).',
            'carte_grise.required' => 'La photo de la carte grise est requise.',
            'carte_grise.max' => 'La photo de la carte grise est trop volumineuse (10 Mo maximum).',
            'assurance.required' => "L'attestation d'assurance est requise.",
            'assurance.max' => "L'attestation d'assurance est trop volumineuse (10 Mo maximum).",
        ];
    }
}
