<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = Report::query()
            ->with('auteur', 'utilisateurSignale')
            ->when($request->query('statut'), fn ($q, $statut) => $q->where('statut', $statut))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ReportResource::collection($reports);
    }

    public function update(Report $report, Request $request)
    {
        $this->authorize('update', $report);

        $request->validate([
            'statut' => ['required', 'in:ouvert,en_cours,resolu,rejete'],
            'resolution' => ['nullable', 'string', 'max:1000'],
        ]);

        $report->update($request->only('statut', 'resolution'));

        return new ReportResource($report->fresh('auteur', 'utilisateurSignale'));
    }
}
