<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            // Contrairement aux documents (permis, carte grise, assurance) qui restent
            // privés, ces informations sont publiques : le passager doit pouvoir
            // reconnaître le véhicule (couleur, photo) et vérifier la plaque à la
            // prise en charge, affichées sur la page de détail du trajet.
            $table->string('vehicule_couleur')->nullable()->after('vehicule_modele');
            $table->string('vehicule_photo')->nullable()->after('vehicule_immatriculation');
        });
    }

    public function down(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            $table->dropColumn(['vehicule_couleur', 'vehicule_photo']);
        });
    }
};
