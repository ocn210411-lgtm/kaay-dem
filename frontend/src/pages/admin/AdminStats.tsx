import { useAdminStats } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  MapPin,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { StatsKpi } from '@/lib/types'

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'var(--color-soleil-500)',
  confirmee: 'var(--color-lagune-500)',
  terminee: 'var(--color-nuit-700)',
  annulee: 'var(--color-ardoise-600)',
  refusee: 'var(--color-braise-500)',
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  terminee: 'Terminée',
  annulee: 'Annulée',
  refusee: 'Refusée',
}

function KpiCard({
  label,
  icon: Icon,
  kpi,
  format: formatFn = (n) => n.toLocaleString('fr-FR'),
  suffix,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  kpi: StatsKpi
  format?: (n: number) => string
  suffix?: string
}) {
  const enHausse = kpi.croissance_pct >= 0

  return (
    <Card className="min-w-0">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
        </div>
        <p className="font-display font-bold text-xl sm:text-3xl text-nuit-800 truncate">
          {formatFn(kpi.total)}
          {suffix && <span className="text-sm sm:text-base font-body font-normal text-muted-foreground ml-1">{suffix}</span>}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs flex-wrap">
          <span
            className={cn(
              'flex items-center gap-0.5 font-medium shrink-0',
              enHausse ? 'text-lagune-600' : 'text-braise-600'
            )}
          >
            {enHausse ? (
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-3.5" aria-hidden="true" />
            )}
            {Math.abs(kpi.croissance_pct)}%
          </span>
          <span className="text-muted-foreground truncate">
            vs mois dernier · {kpi.ce_mois} ce mois-ci
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminStats() {
  const { data, isLoading } = useAdminStats()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const revenusParMois = data.revenus_par_mois.map((r) => ({ ...r, total: Number(r.total) }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl">Statistiques</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vue d'ensemble de l'activité de la plateforme, mise à jour en temps réel.
        </p>
      </div>

      {/* KPI principaux avec tendance vs mois précédent */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Utilisateurs" icon={Users} kpi={data.kpis.utilisateurs} />
        <KpiCard label="Trajets publiés" icon={MapPin} kpi={data.kpis.trajets} />
        <KpiCard label="Réservations" icon={Calendar} kpi={data.kpis.reservations} />
        <KpiCard
          label="Revenu estimé"
          icon={CreditCard}
          kpi={data.kpis.revenu_estime}
          format={(n) => n.toLocaleString('fr-FR')}
          suffix="FCFA"
        />
      </div>

      {/* Croissance des utilisateurs + revenus par mois */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="size-4" aria-hidden="true" />
              Croissance des utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.utilisateurs_par_mois.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Pas encore de données.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.utilisateurs_par_mois}>
                  <defs>
                    <linearGradient id="cumuleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-soleil-500)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-soleil-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-sable-200)" />
                  <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, borderColor: 'var(--color-sable-200)', fontSize: 13 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumule"
                    name="Utilisateurs cumulés"
                    stroke="var(--color-soleil-500)"
                    fill="url(#cumuleGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Revenu estimé par mois</CardTitle>
          </CardHeader>
          <CardContent>
            {revenusParMois.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Pas encore de données.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenusParMois}>
                  <CartesianGrid vertical={false} stroke="var(--color-sable-200)" />
                  <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    formatter={(value) => `${Number(value).toLocaleString('fr-FR')} FCFA`}
                    contentStyle={{ borderRadius: 8, borderColor: 'var(--color-sable-200)', fontSize: 13 }}
                  />
                  <Bar dataKey="total" name="Revenu (FCFA)" fill="var(--color-lagune-500)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trajets par mois + répartition des réservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Trajets publiés par mois</CardTitle>
          </CardHeader>
          <CardContent>
            {data.trajets_par_mois.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Pas encore de données.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.trajets_par_mois}>
                  <CartesianGrid vertical={false} stroke="var(--color-sable-200)" />
                  <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, borderColor: 'var(--color-sable-200)', fontSize: 13 }}
                  />
                  <Bar dataKey="total" name="Trajets" fill="var(--color-soleil-500)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Réservations par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {data.reservations_par_statut.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Pas encore de données.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.reservations_par_statut}
                    dataKey="total"
                    nameKey="statut"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {data.reservations_par_statut.map((entry) => (
                      <Cell key={entry.statut} fill={STATUT_COLORS[entry.statut] ?? 'var(--color-ardoise-600)'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, entry) => {
                      const statut = (entry?.payload as { statut?: string })?.statut
                      return [value, statut ? (STATUT_LABELS[statut] ?? statut) : '']
                    }}
                    contentStyle={{ borderRadius: 8, borderColor: 'var(--color-sable-200)', fontSize: 13 }}
                  />
                  <Legend
                    formatter={(value: string) => STATUT_LABELS[value] ?? value}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Villes populaires + indicateurs qualité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Villes de départ les plus populaires</CardTitle>
          </CardHeader>
          <CardContent>
            {data.villes_populaires.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Pas encore de données.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.villes_populaires} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid horizontal={false} stroke="var(--color-sable-200)" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="ville"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, borderColor: 'var(--color-sable-200)', fontSize: 13 }}
                  />
                  <Bar dataKey="total" name="Trajets" fill="var(--color-braise-500)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Taux d'occupation moyen</p>
              <p className="font-display font-bold text-3xl text-lagune-600">
                {(data.taux_occupation_moyen * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">des places proposées sont réservées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Taux d'annulation</p>
                <XCircle className="size-4 text-braise-500" aria-hidden="true" />
              </div>
              <p className="font-display font-bold text-3xl text-braise-600">
                {data.taux_annulation}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">des réservations annulées ou refusées</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top conducteurs + activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Top conducteurs</CardTitle>
          </CardHeader>
          <CardContent>
            {data.top_conducteurs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de données.</p>
            ) : (
              <ol className="space-y-3">
                {data.top_conducteurs.map((c, i) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="flex items-center justify-center size-6 rounded-full bg-nuit-800 text-sable-50 text-xs font-mono shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-medium truncate min-w-0">{c.nom}</span>
                    </span>
                    <span className="text-muted-foreground font-mono shrink-0 whitespace-nowrap text-xs sm:text-sm">
                      {c.trajets_count} trajet(s)
                      {c.note_moyenne != null ? ` · ${c.note_moyenne.toFixed(1)}★` : ''}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activite_recente.length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore d'activité.</p>
            ) : (
              <ul className="space-y-3">
                {data.activite_recente.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className={cn(
                        'size-1.5 rounded-full mt-1.5 shrink-0',
                        a.type === 'trajet' ? 'bg-soleil-500' : 'bg-lagune-500'
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate">{a.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(a.date), { addSuffix: true, locale: fr })}
                        {' · '}
                        {format(new Date(a.date), 'd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
