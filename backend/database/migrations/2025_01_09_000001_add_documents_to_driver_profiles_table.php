<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            // Dossier complet de vérification conducteur : permis (recto/verso +
            // date d'expiration), carte grise du véhicule, attestation d'assurance.
            $table->date('date_expiration_permis')->nullable()->after('numero_permis');
            $table->string('permis_recto')->nullable()->after('date_expiration_permis');
            $table->string('permis_verso')->nullable()->after('permis_recto');
            $table->string('carte_grise')->nullable()->after('vehicule_immatriculation');
            $table->string('assurance')->nullable()->after('carte_grise');
        });
    }

    public function down(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'date_expiration_permis',
                'permis_recto',
                'permis_verso',
                'carte_grise',
                'assurance',
            ]);
        });
    }
};
