<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $debutMois = Carbon::now()->startOfMonth();
        $debutMoisPrecedent = Carbon::now()->subMonthNoOverflow()->startOfMonth();
        $finMoisPrecedent = $debutMois->copy()->subSecond();

        return response()->json([
            'kpis' => [
                'utilisateurs' => $this->kpi(User::query(), $debutMois, $debutMoisPrecedent, $finMoisPrecedent),
                'trajets' => $this->kpi(Trip::query(), $debutMois, $debutMoisPrecedent, $finMoisPrecedent),
                'reservations' => $this->kpi(Reservation::query(), $debutMois, $debutMoisPrecedent, $finMoisPrecedent),
                'revenu_estime' => $this->kpiRevenu($debutMois, $debutMoisPrecedent, $finMoisPrecedent),
            ],
            'utilisateurs_par_mois' => $this->serieCumulativeParMois(User::query()),
            'trajets_par_mois' => $this->serieParMois(Trip::query(), 'date_heure_depart'),
            'revenus_par_mois' => $this->revenusParMois(),
            'reservations_par_statut' => $this->reservationsParStatut(),
            'taux_occupation_moyen' => round((float) (
                Trip::query()
                    ->where('statut', '!=', 'annule')
                    ->selectRaw('AVG((places_totales - places_disponibles) / places_totales) as taux')
                    ->value('taux') ?? 0
            ), 2),
            'taux_annulation' => $this->tauxAnnulation(),
            'villes_populaires' => $this->villesPopulaires(),
            'top_conducteurs' => $this->topConducteurs(),
            'activite_recente' => $this->activiteRecente(),
            'totaux' => [
                'utilisateurs' => User::count(),
                'trajets' => Trip::count(),
                'reservations' => Reservation::count(),
                'conducteurs_valides' => User::whereHas(
                    'driverProfile',
                    fn ($q) => $q->where('statut', 'validee')
                )->count(),
            ],
        ]);
    }

    /**
     * KPI générique : total, total ce mois-ci, et croissance % vs le mois précédent.
     */
    private function kpi($query, Carbon $debutMois, Carbon $debutMoisPrecedent, Carbon $finMoisPrecedent): array
    {
        $total = (clone $query)->count();
        $ceMois = (clone $query)->where('created_at', '>=', $debutMois)->count();
        $moisPrecedent = (clone $query)
            ->whereBetween('created_at', [$debutMoisPrecedent, $finMoisPrecedent])
            ->count();

        return [
            'total' => $total,
            'ce_mois' => $ceMois,
            'croissance_pct' => $this->pctCroissance($moisPrecedent, $ceMois),
        ];
    }

    private function kpiRevenu(Carbon $debutMois, Carbon $debutMoisPrecedent, Carbon $finMoisPrecedent): array
    {
        $base = Reservation::query()
            ->whereIn('reservations.statut', ['confirmee', 'terminee'])
            ->join('trips', 'trips.id', '=', 'reservations.trip_id')
            ->selectRaw('COALESCE(SUM(reservations.nombre_places * trips.prix_place), 0) as revenu');

        $total = (clone $base)->value('revenu');
        $ceMois = (clone $base)->where('reservations.created_at', '>=', $debutMois)->value('revenu');
        $moisPrecedent = (clone $base)
            ->whereBetween('reservations.created_at', [$debutMoisPrecedent, $finMoisPrecedent])
            ->value('revenu');

        return [
            'total' => (float) $total,
            'ce_mois' => (float) $ceMois,
            'croissance_pct' => $this->pctCroissance((float) $moisPrecedent, (float) $ceMois),
        ];
    }

    private function pctCroissance(float $avant, float $apres): float
    {
        if ($avant <= 0) {
            return $apres > 0 ? 100.0 : 0.0;
        }

        return round((($apres - $avant) / $avant) * 100, 1);
    }

    private function serieParMois($query, string $dateColonne)
    {
        return (clone $query)
            ->selectRaw("DATE_FORMAT({$dateColonne}, '%Y-%m') as mois, COUNT(*) as total")
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();
    }

    private function serieCumulativeParMois($query)
    {
        $parMois = $this->serieParMois($query, 'created_at');

        $cumule = 0;

        return $parMois->map(function ($ligne) use (&$cumule) {
            $cumule += $ligne->total;

            return [
                'mois' => $ligne->mois,
                'total' => $ligne->total,
                'cumule' => $cumule,
            ];
        });
    }

    private function revenusParMois()
    {
        return Reservation::query()
            ->whereIn('reservations.statut', ['confirmee', 'terminee'])
            ->join('trips', 'trips.id', '=', 'reservations.trip_id')
            ->selectRaw("DATE_FORMAT(reservations.created_at, '%Y-%m') as mois, COALESCE(SUM(reservations.nombre_places * trips.prix_place), 0) as total")
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();
    }

    private function reservationsParStatut()
    {
        return Reservation::query()
            ->selectRaw('statut, COUNT(*) as total')
            ->groupBy('statut')
            ->get();
    }

    private function tauxAnnulation(): float
    {
        $total = Reservation::count();
        if ($total === 0) {
            return 0.0;
        }

        $annulees = Reservation::whereIn('statut', ['annulee', 'refusee'])->count();

        return round(($annulees / $total) * 100, 1);
    }

    private function villesPopulaires()
    {
        return Trip::query()
            ->selectRaw('ville_depart as ville, COUNT(*) as total')
            ->groupBy('ville_depart')
            ->orderByDesc('total')
            ->take(6)
            ->get();
    }

    private function topConducteurs()
    {
        return User::query()
            ->withCount(['tripsAsDriver as trajets_count'])
            ->whereHas('driverProfile', fn ($q) => $q->where('statut', 'validee'))
            ->orderByDesc('trajets_count')
            ->take(5)
            ->get(['id', 'nom', 'email'])
            ->map(fn ($u) => [
                'id' => $u->id,
                'nom' => $u->nom,
                'trajets_count' => $u->trajets_count,
                'note_moyenne' => $u->noteMoyenneConducteur(),
            ]);
    }

    private function activiteRecente()
    {
        $trajets = Trip::query()
            ->with('driver:id,nom')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($t) => [
                'type' => 'trajet',
                'description' => "{$t->driver->nom} a publié {$t->ville_depart} → {$t->ville_arrivee}",
                'date' => $t->created_at,
            ]);

        $reservations = Reservation::query()
            ->with('passenger:id,nom')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($r) => [
                'type' => 'reservation',
                'description' => "{$r->passenger->nom} a réservé {$r->nombre_places} place(s)",
                'date' => $r->created_at,
            ]);

        return $trajets->concat($reservations)
            ->sortByDesc('date')
            ->take(8)
            ->values();
    }
}
