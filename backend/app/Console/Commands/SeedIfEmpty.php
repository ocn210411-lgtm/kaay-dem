<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SeedIfEmpty extends Command
{
    protected $signature = 'app:seed-if-empty';

    protected $description = "Lance le seeding uniquement si la base est vide (utile sur le tiers gratuit de Render, qui n'a pas de Shell/One-Off Jobs pour lancer db:seed manuellement une fois déployé).";

    public function handle(): int
    {
        if (User::query()->exists()) {
            $this->info('Base déjà peuplée — seeding ignoré.');

            return self::SUCCESS;
        }

        $this->info('Base vide détectée : lancement du seeding initial...');
        $this->call('db:seed', ['--force' => true]);

        return self::SUCCESS;
    }
}
