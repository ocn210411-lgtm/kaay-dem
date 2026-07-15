<?php

namespace App\Models;

use App\Enums\RoleDemandeStatut;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'numero_permis',
        'date_expiration_permis',
        'permis_recto',
        'permis_verso',
        'vehicule_marque',
        'vehicule_modele',
        'vehicule_couleur',
        'vehicule_immatriculation',
        'vehicule_photo',
        'carte_grise',
        'assurance',
        'statut',
        'motif_rejet',
        'valide_par',
        'valide_at',
    ];

    protected function casts(): array
    {
        return [
            'statut' => RoleDemandeStatut::class,
            'valide_at' => 'datetime',
            'date_expiration_permis' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function validateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par');
    }
}
