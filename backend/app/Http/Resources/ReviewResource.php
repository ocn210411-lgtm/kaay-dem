<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        if (! $this->resource) {
            return [];
        }

        return [
            'id' => $this->id,
            'reservation_id' => $this->reservation_id,
            'note' => $this->note,
            'commentaire' => $this->commentaire,
            'created_at' => $this->created_at,
        ];
    }
}
