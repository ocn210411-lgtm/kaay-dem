<?php

use App\Http\Controllers\Api\V1\Admin\DriverRequestController as AdminDriverRequestController;
use App\Http\Controllers\Api\V1\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\V1\Admin\StatsController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DriverRequestController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\ReservationController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\TripController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Authentification (EF-01)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Trajets : recherche publique (EF-04)
    Route::get('/trips', [TripController::class, 'index']);
    Route::get('/trips/{trip}', [TripController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [ProfileController::class, 'update']);
        Route::post('/me', [ProfileController::class, 'update']); // support multipart (photo) via POST + _method=PUT côté front

        // EF-02 : demande de statut conducteur
        Route::post('/driver-requests', [DriverRequestController::class, 'store']);
        Route::put('/driver-profile', [DriverRequestController::class, 'update']);
        Route::post('/driver-profile', [DriverRequestController::class, 'update']); // multipart via POST + _method=PUT côté front

        // EF-03 : CRUD trajets (conducteur validé)
        Route::post('/trips', [TripController::class, 'store']);
        Route::put('/trips/{trip}', [TripController::class, 'update']);
        Route::delete('/trips/{trip}', [TripController::class, 'destroy']);
        Route::patch('/trips/{trip}/close', [TripController::class, 'close']);
        Route::get('/trips/{trip}/reservations', [ReservationController::class, 'tripReservations']);

        // EF-05 / EF-06 : réservations
        Route::post('/trips/{trip}/reservations', [ReservationController::class, 'store']);
        Route::get('/reservations', [ReservationController::class, 'myReservations']);
        Route::patch('/reservations/{reservation}/accept', [ReservationController::class, 'accept']);
        Route::patch('/reservations/{reservation}/refuse', [ReservationController::class, 'refuse']);
        Route::patch('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);

        // EF-07 : évaluations
        Route::post('/reservations/{reservation}/review', [ReviewController::class, 'store']);

        // Signalements (EF-09)
        Route::post('/reports', [ReportController::class, 'store']);

        // EF-08 : tableaux de bord
        Route::get('/dashboard/driver', [DashboardController::class, 'driver']);
        Route::get('/dashboard/passenger', [DashboardController::class, 'passenger']);
        Route::get('/dashboard/driver/reservations', [DashboardController::class, 'receivedReservations']);

        // Administration (EF-09)
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::patch('/users/{user}/toggle-active', [AdminUserController::class, 'toggleActive']);

            Route::get('/driver-requests', [AdminDriverRequestController::class, 'index']);
            Route::patch('/driver-requests/{driverRequest}/accept', [AdminDriverRequestController::class, 'accept']);
            Route::patch('/driver-requests/{driverRequest}/reject', [AdminDriverRequestController::class, 'reject']);

            Route::get('/reports', [AdminReportController::class, 'index']);
            Route::patch('/reports/{report}', [AdminReportController::class, 'update']);

            Route::get('/stats', [StatsController::class, 'index']);
        });
    });
});
