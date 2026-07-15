<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFactory extends Factory
{
    public function definition(): array
    {
        $villes = ['Dakar', 'Rufisque', 'Diamniadio', 'Bargny', 'Sébikotane', 'Thiès'];
        $depart = fake()->randomElement($villes);
        $arrivee = fake()->randomElement(array_diff($villes, [$depart]));
        $places = fake()->numberBetween(2, 6);

        return [
            'driver_id' => User::factory(),
            'ville_depart' => $depart,
            'ville_arrivee' => $arrivee,
            'points_arret' => [],
            'date_heure_depart' => fake()->dateTimeBetween('now', '+2 weeks'),
            'places_totales' => $places,
            'places_disponibles' => $places,
            'prix_place' => fake()->numberBetween(500, 3000),
            'statut' => 'publie',
        ];
    }
}
