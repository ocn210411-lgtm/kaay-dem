<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignId('passenger_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('nombre_places');
            $table->string('statut')->default('en_attente'); // en_attente|confirmee|terminee|annulee|refusee
            $table->timestamps();
            $table->softDeletes();

            $table->index(['passenger_id', 'statut']);
        });

        Schema::create('reservation_transitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->cascadeOnDelete();
            $table->string('de_statut')->nullable();
            $table->string('vers_statut');
            $table->foreignId('acteur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_transitions');
        Schema::dropIfExists('reservations');
    }
};
