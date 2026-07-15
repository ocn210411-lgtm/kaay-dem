<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DriverProfileResource;
use App\Models\DriverProfile;
use Illuminate\Http\Request;

class DriverRequestController extends Controller
{
    public function index(Request $request)
    {
        $profiles = DriverProfile::with('user')
            ->when($request->query('statut'), fn ($q, $statut) => $q->where('statut', $statut))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return DriverProfileResource::collection($profiles);
    }

    public function accept(DriverProfile $driverRequest, Request $request)
    {
        $driverRequest->update([
            'statut' => 'validee',
            'valide_par' => $request->user()->id,
            'valide_at' => now(),
        ]);

        return new DriverProfileResource($driverRequest->fresh('user'));
    }

    public function reject(DriverProfile $driverRequest, Request $request)
    {
        // Obligatoire : le conducteur doit savoir précisément ce qu'il doit
        // corriger avant de renvoyer son dossier (affiché sur son profil,
        // cf. ConducteurTab côté frontend).
        $request->validate([
            'motif_rejet' => ['required', 'string', 'min:3', 'max:1000'],
        ], [
            'motif_rejet.required' => 'Le motif du rejet est requis : le conducteur doit savoir quoi corriger.',
        ]);

        $driverRequest->update([
            'statut' => 'rejetee',
            'motif_rejet' => $request->input('motif_rejet'),
            'valide_par' => $request->user()->id,
            'valide_at' => now(),
        ]);

        return new DriverProfileResource($driverRequest->fresh('user'));
    }
}
