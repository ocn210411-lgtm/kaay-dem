<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            // Coordonnées GPS exactes du point de départ et d'arrivée, choisies
            // par le conducteur sur une carte lors de la création du trajet.
            // Nullable : un trajet peut n'avoir que des noms de ville (rétro-compatible).
            $table->decimal('depart_lat', 10, 7)->nullable()->after('ville_depart');
            $table->decimal('depart_lng', 10, 7)->nullable()->after('depart_lat');
            $table->decimal('arrivee_lat', 10, 7)->nullable()->after('ville_arrivee');
            $table->decimal('arrivee_lng', 10, 7)->nullable()->after('arrivee_lat');
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn(['depart_lat', 'depart_lng', 'arrivee_lat', 'arrivee_lng']);
        });
    }
};
