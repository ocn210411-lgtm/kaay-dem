<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(StoreReportRequest $request)
    {
        $report = Report::create([
            ...$request->validated(),
            'auteur_id' => $request->user()->id,
            'statut' => 'ouvert',
        ]);

        return new ReportResource($report->load('auteur', 'utilisateurSignale'));
    }
}
