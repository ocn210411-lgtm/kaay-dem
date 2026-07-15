<?php

namespace App\Models;

use App\Enums\ReservationStatut;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'trip_id',
        'passenger_id',
        'nombre_places',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'statut' => ReservationStatut::class,
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function passenger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    public function transitions(): HasMany
    {
        return $this->hasMany(ReservationTransition::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }
}
