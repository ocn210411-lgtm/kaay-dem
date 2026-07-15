import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PaginatedResponse } from '@/lib/types'
import type { User } from '@/store/auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star } from 'lucide-react'

type Role = 'conducteur' | 'passager'

function UsersTable({ role, search }: { role: Role; search: string }) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', role, search],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<User>>('/admin/users', {
        params: { q: search || undefined, role },
      })
      return data
    },
  })

  const toggleActive = useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-active`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />
  }

  if (data && data.data.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground">
          {role === 'conducteur' ? 'Aucun conducteur validé.' : 'Aucun passager.'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile (< sm) : liste de cartes — un tableau à 4-6 colonnes ne peut
          pas tenir sur un petit écran sans tronquer l'e-mail ou cacher
          l'action derrière un défilement horizontal peu visible. */}
      <div className="space-y-3 sm:hidden">
        {data?.data.map((user) => (
          <div key={user.id} className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{user.nom}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <Badge variant={user.actif ? 'outline' : 'destructive'} className="shrink-0">
                {user.actif ? 'Actif' : 'Désactivé'}
              </Badge>
            </div>
            {role === 'conducteur' && (
              <div className="text-sm text-muted-foreground flex items-center justify-between">
                <span className="truncate">
                  {user.driver_profile
                    ? `${user.driver_profile.vehicule.marque} ${user.driver_profile.vehicule.modele}`
                    : 'Véhicule non renseigné'}
                </span>
                {user.note_moyenne_conducteur != null && (
                  <span className="flex items-center gap-1 shrink-0">
                    <Star className="size-3.5 fill-soleil-500 text-soleil-500" aria-hidden="true" />
                    {user.note_moyenne_conducteur.toFixed(1)}
                  </span>
                )}
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={toggleActive.isPending}
              onClick={() => toggleActive.mutate(user.id)}
            >
              {user.actif ? 'Désactiver' : 'Activer'}
            </Button>
          </div>
        ))}
      </div>

      {/* Desktop/tablette (sm+) : tableau classique, plus dense et adapté à
          une largeur d'écran suffisante pour toutes les colonnes. */}
      <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>E-mail</TableHead>
              {role === 'conducteur' && <TableHead>Véhicule</TableHead>}
              {role === 'conducteur' && <TableHead>Note</TableHead>}
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nom}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                {role === 'conducteur' && (
                  <TableCell className="text-muted-foreground">
                    {user.driver_profile
                      ? `${user.driver_profile.vehicule.marque} ${user.driver_profile.vehicule.modele}`
                      : '—'}
                  </TableCell>
                )}
                {role === 'conducteur' && (
                  <TableCell className="text-muted-foreground">
                    {user.note_moyenne_conducteur != null ? (
                      <span className="flex items-center gap-1">
                        <Star className="size-3.5 fill-soleil-500 text-soleil-500" aria-hidden="true" />
                        {user.note_moyenne_conducteur.toFixed(1)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant={user.actif ? 'outline' : 'destructive'}>
                    {user.actif ? 'Actif' : 'Désactivé'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={toggleActive.isPending}
                    onClick={() => toggleActive.mutate(user.id)}
                  >
                    {user.actif ? 'Désactiver' : 'Activer'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export function AdminUsers() {
  const [search, setSearch] = useState('')

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="font-display font-semibold text-2xl">Utilisateurs</h1>

      <Input
        placeholder="Rechercher par nom ou e-mail…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Tabs defaultValue="passager">
        <TabsList>
          <TabsTrigger value="passager">Passagers</TabsTrigger>
          <TabsTrigger value="conducteur">Conducteurs</TabsTrigger>
        </TabsList>
        <TabsContent value="passager" className="mt-4">
          <UsersTable role="passager" search={search} />
        </TabsContent>
        <TabsContent value="conducteur" className="mt-4">
          <UsersTable role="conducteur" search={search} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
