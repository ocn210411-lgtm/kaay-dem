<?php

namespace Database\Seeders;

use App\Models\DriverProfile;
use App\Models\Reservation;
use App\Models\Review;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Compte admin de test
        User::factory()->admin()->create([
            'nom' => 'Admin Kaay Dem',
            'email' => 'admin@kaaydem.test',
        ]);

        // Conducteurs validés avec leurs trajets
        $conducteurs = User::factory()->count(6)->create([
            'campus' => 'Diamniadio',
        ]);

        $conducteurs->each(function (User $conducteur) {
            DriverProfile::factory()->create(['user_id' => $conducteur->id]);
            Trip::factory()->count(rand(2, 4))->create(['driver_id' => $conducteur->id]);
        });

        // Compte de test conducteur connu
        $testDriver = User::factory()->create([
            'nom' => 'Amadou Diop (Conducteur test)',
            'email' => 'conducteur@kaaydem.test',
        ]);
        DriverProfile::factory()->create(['user_id' => $testDriver->id]);
        Trip::factory()->count(3)->create(['driver_id' => $testDriver->id]);

        // Passagers
        $passagers = User::factory()->count(15)->create();

        // Compte de test passager connu
        $testPassenger = User::factory()->create([
            'nom' => 'Fatou Ndiaye (Passager test)',
            'email' => 'passager@kaaydem.test',
        ]);
        $passagers->push($testPassenger);

        // Réservations + avis sur des trajets existants
        $trips = Trip::all();
        foreach ($passagers as $passager) {
            $trip = $trips->random();
            if ($trip->driver_id === $passager->id) {
                continue;
            }

            $reservation = Reservation::factory()->create([
                'trip_id' => $trip->id,
                'passenger_id' => $passager->id,
                'statut' => fake()->randomElement(['en_attente', 'confirmee', 'terminee']),
            ]);

            if ($reservation->statut->value === 'terminee') {
                Review::factory()->create(['reservation_id' => $reservation->id]);
            }
        }
    }
}
