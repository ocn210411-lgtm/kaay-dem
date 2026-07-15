<?php

use App\Exceptions\PlacesInsuffisantesException;
use App\Exceptions\ReservationInvalideException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Pas de statefulApi() : l'authentification se fait exclusivement par
        // Bearer token (Sanctum personal access tokens), jamais par cookies/session.
        // statefulApi() active EnsureFrontendRequestsAreStateful, qui traite toute
        // requête dont l'en-tête Origin/Referer correspond à SANCTUM_STATEFUL_DOMAINS
        // comme une requête SPA "stateful" — ça ajoute alors EncryptCookies,
        // StartSession et surtout ValidateCsrfToken au pipeline. Le frontend
        // n'appelle jamais /sanctum/csrf-cookie et n'envoie pas de cookies
        // (pas de withCredentials), donc cette requête échoue avec "CSRF token
        // mismatch" avant même d'atteindre le contrôleur — un curl sans en-tête
        // Origin ne déclenche pas ce chemin et fonctionne, ce qui rendait le bug
        // invisible en test direct API mais bloquant depuis le vrai navigateur.
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (PlacesInsuffisantesException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => $e->getMessage()], 409);
            }
        });

        $exceptions->render(function (ReservationInvalideException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => $e->getMessage()], 409);
            }
        });

        $exceptions->render(function (ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Les données fournies sont invalides.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => $e->getMessage() ?: 'Action non autorisée.'], 403);
            }
        });

        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Ressource introuvable.'], 404);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }
        });
    })->create();
