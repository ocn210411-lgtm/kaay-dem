<?php

namespace App\Models;

use App\Enums\ReportStatut;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'auteur_id',
        'utilisateur_signale_id',
        'trip_id',
        'motif',
        'statut',
        'resolution',
    ];

    protected function casts(): array
    {
        return [
            'statut' => ReportStatut::class,
        ];
    }

    public function auteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    public function utilisateurSignale(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilisateur_signale_id');
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}
