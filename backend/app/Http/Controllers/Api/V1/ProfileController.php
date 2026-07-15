<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            $data['photo'] = $request->file('photo')->store('photos', 'public');
        }

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        // Sans ce chargement explicite, whenLoaded('driverProfile') dans
        // UserResource omet la clé "driver_profile" de la réponse — et comme
        // le frontend REMPLACE tout l'utilisateur en mémoire par cette
        // réponse (setUser), ça effacerait silencieusement le dossier
        // conducteur du store dès qu'on modifie son nom/téléphone/mot de
        // passe, jusqu'au prochain rafraîchissement via /me.
        return new UserResource($user->fresh()->load('driverProfile'));
    }
}
