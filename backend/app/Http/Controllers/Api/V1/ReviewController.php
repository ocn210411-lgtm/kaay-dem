<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Reservation;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function store(StoreReviewRequest $request, Reservation $reservation)
    {
        $this->authorize('create', [\App\Models\Review::class, $reservation]);

        if ($reservation->review()->exists()) {
            throw ValidationException::withMessages([
                'reservation' => ["Ce trajet a déjà été évalué."],
            ]);
        }

        $review = $reservation->review()->create($request->validated());

        return new ReviewResource($review);
    }
}
