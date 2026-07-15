<?php

namespace Database\Factories;

use App\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'reservation_id' => Reservation::factory(),
            'note' => fake()->numberBetween(3, 5),
            'commentaire' => fake()->optional()->sentence(),
        ];
    }
}
