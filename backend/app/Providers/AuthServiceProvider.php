<?php

namespace App\Providers;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Review;
use App\Models\Trip;
use App\Policies\ReportPolicy;
use App\Policies\ReservationPolicy;
use App\Policies\ReviewPolicy;
use App\Policies\TripPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Trip::class => TripPolicy::class,
        Reservation::class => ReservationPolicy::class,
        Review::class => ReviewPolicy::class,
        Report::class => ReportPolicy::class,
    ];

    public function boot(): void
    {
        //
    }
}
