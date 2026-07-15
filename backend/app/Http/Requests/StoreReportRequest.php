<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'utilisateur_signale_id' => ['required', 'integer', 'exists:users,id'],
            'trip_id' => ['nullable', 'integer', 'exists:trips,id'],
            'motif' => ['required', 'string', 'max:1000'],
        ];
    }
}
