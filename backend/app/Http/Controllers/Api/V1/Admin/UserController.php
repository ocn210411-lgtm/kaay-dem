<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->query('q'), function ($q, $search) {
                $q->where('nom', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->query('role') === 'conducteur', function ($q) {
                $q->whereHas('driverProfile', fn ($dp) => $dp->where('statut', 'validee'));
            })
            ->when($request->query('role') === 'passager', function ($q) {
                $q->whereDoesntHave('driverProfile', fn ($dp) => $dp->where('statut', 'validee'));
            })
            ->with('driverProfile')
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return UserResource::collection($users);
    }

    public function toggleActive(User $user)
    {
        $user->update(['actif' => ! $user->actif]);

        // index() ci-dessus charge driverProfile (affiché dans les colonnes
        // Véhicule/Note de la liste admin) : sans le même chargement ici,
        // basculer l'activation d'un conducteur ferait disparaître ces
        // colonnes pour cette ligne dans le cache local le temps d'un refetch.
        return new UserResource($user->fresh()->load('driverProfile'));
    }
}
