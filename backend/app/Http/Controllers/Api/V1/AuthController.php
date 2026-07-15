<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'nom' => $request->nom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telephone' => $request->telephone,
            'campus' => $request->campus,
        ]);

        $token = $user->createToken('kaaydem')->plainTextToken;

        // Cohérence avec login()/me() : garantit que "driver_profile" est
        // toujours soit rempli, soit explicitement absent parce qu'aucun
        // dossier n'existe — jamais omis simplement parce que la relation
        // n'a pas été chargée (cf. commentaire détaillé dans login()).
        $user->load('driverProfile');

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ["Les identifiants fournis sont incorrects."],
            ]);
        }

        if (! $user->actif) {
            throw ValidationException::withMessages([
                'email' => ["Ce compte a été désactivé."],
            ]);
        }

        $token = $user->createToken('kaaydem')->plainTextToken;

        // Sans ce chargement explicite, whenLoaded('driverProfile') dans
        // UserResource omet complètement la clé "driver_profile" de la
        // réponse (au lieu de la renvoyer à null) — le frontend croit alors,
        // juste après la connexion, qu'aucun dossier conducteur n'existe
        // (ex. le lien "Devenir conducteur" resterait affiché à tort, ou une
        // redirection basée sur ce champ ne se déclencherait pas) jusqu'à ce
        // qu'un appel à /me vienne rafraîchir l'utilisateur en mémoire.
        $user->load('driverProfile');

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user()->load('driverProfile'));
    }
}
