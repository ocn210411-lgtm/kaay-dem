<?php

namespace App\Models;

use App\Enums\TripStatut;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trip extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'driver_id',
        'ville_depart',
        'depart_lat',
        'depart_lng',
        'ville_arrivee',
        'arrivee_lat',
        'arrivee_lng',
        'points_arret',
        'date_heure_depart',
        'places_totales',
        'places_disponibles',
        'prix_place',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'points_arret' => 'array',
            'date_heure_depart' => 'datetime',
            'prix_place' => 'decimal:2',
            'statut' => TripStatut::class,
            'depart_lat' => 'decimal:7',
            'depart_lng' => 'decimal:7',
            'arrivee_lat' => 'decimal:7',
            'arrivee_lng' => 'decimal:7',
        ];
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function reservationsActives(): HasMany
    {
        return $this->reservations()->whereIn('statut', ['en_attente', 'confirmee']);
    }

    public function aDesReservationsConfirmees(): bool
    {
        return $this->reservations()->where('statut', 'confirmee')->exists();
    }

    public function scopeRecherche($query, ?string $depart, ?string $arrivee, ?string $date)
    {
        return $query
            ->when($depart, fn ($q) => $q->where('ville_depart', 'like', "%{$depart}%"))
            ->when($arrivee, fn ($q) => $q->where('ville_arrivee', 'like', "%{$arrivee}%"))
            ->when($date, fn ($q) => $q->whereDate('date_heure_depart', $date));
    }
}
