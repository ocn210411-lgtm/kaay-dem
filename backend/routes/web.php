<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Kaay Dem !',
        'message' => "API de covoiturage étudiant. Voir /api/v1 pour les endpoints.",
    ]);
});
