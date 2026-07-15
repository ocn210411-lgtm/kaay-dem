<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DriverProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'numero_permis' => strtoupper(fake()->bothify('PR-####-??')),
            'vehicule_marque' => fake()->randomElement(['Toyota', 'Renault', 'Hyundai', 'Peugeot']),
            'vehicule_modele' => fake()->word(),
            'vehicule_immatriculation' => strtoupper(fake()->bothify('DK-####-??')),
            'statut' => 'validee',
            'valide_at' => now(),
        ];
    }
}
