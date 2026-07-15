<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Usage: middleware('role:conducteur') ou middleware('role:admin,conducteur')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $matches = collect($roles)->contains(function (string $role) use ($user) {
            return match ($role) {
                'admin' => (bool) $user->is_admin,
                'conducteur' => $user->isConducteurValide(),
                'passager' => true,
                default => false,
            };
        });

        if (! $matches) {
            return response()->json(['message' => "Vous n'avez pas les droits pour cette action."], 403);
        }

        return $next($request);
    }
}
