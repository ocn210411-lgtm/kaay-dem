<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nom',
        'email',
        'password',
        'telephone',
        'campus',
        'photo',
        'is_admin',
        'actif',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'actif' => 'boolean',
        ];
    }

    public function driverProfile(): HasOne
    {
        return $this->hasOne(DriverProfile::class);
    }

    public function tripsAsDriver(): HasMany
    {
        return $this->hasMany(Trip::class, 'driver_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'passenger_id');
    }

    public function reportsAuteur(): HasMany
    {
        return $this->hasMany(Report::class, 'auteur_id');
    }

    public function isConducteurValide(): bool
    {
        return $this->driverProfile()->where('statut', 'validee')->exists();
    }

    public function noteMoyenneConducteur(): ?float
    {
        $moyenne = Review::whereHas('reservation.trip', fn ($q) => $q->where('driver_id', $this->id))
            ->avg('note');

        return $moyenne !== null ? round($moyenne, 2) : null;
    }
}
