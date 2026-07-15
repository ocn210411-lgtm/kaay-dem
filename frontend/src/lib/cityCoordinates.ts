/**
 * Coordonnées approximatives des villes/quartiers autour de Dakar, utilisées
 * pour la carte interactive du détail d'un trajet (fonctionnalité bonus du
 * cahier des charges) quand le conducteur n'a pas renseigné de point exact
 * via le sélecteur GPS (LocationPicker).
 *
 * Important : Kaay Dem ne se limite à aucun corridor fixe — chaque trajet a
 * son propre point de départ et sa propre destination, n'importe où à Dakar
 * et ses environs (Plateau, Ouakam, Yoff, Parcelles Assainies, Diamniadio,
 * Rufisque, etc.). Cette table n'est qu'un filet de sécurité pour centrer la
 * carte approximativement quand aucune coordonnée exacte n'existe ; elle ne
 * restreint en rien les villes acceptées par l'application (ville_depart et
 * ville_arrivee sont de simples champs texte libres, cf. StoreTripRequest).
 */
export const CITY_COORDINATES: Record<string, [number, number]> = {
  dakar: [14.6928, -17.4467],
  rufisque: [14.7167, -17.2667],
  diamniadio: [14.7311, -17.1875],
  bargny: [14.6969, -17.2231],
  'sébikotane': [14.75, -17.1333],
  sebikotane: [14.75, -17.1333],
  'thiès': [14.791, -16.9256],
  thies: [14.791, -16.9256],
  pikine: [14.7549, -17.3958],
  guédiawaye: [14.7833, -17.4],
  'guédiawaye ': [14.7833, -17.4],
  'mbour': [14.4167, -16.9667],
  bambey: [14.7, -16.45],
  // Quartiers / communes de Dakar intra-muros, pour que la carte se centre
  // correctement même sans coordonnées GPS exactes.
  plateau: [14.6664, -17.4324],
  medina: [14.6789, -17.4406],
  ouakam: [14.7167, -17.4833],
  ngor: [14.7461, -17.5153],
  yoff: [14.7458, -17.4675],
  'almadies': [14.7364, -17.5142],
  'point e': [14.6944, -17.4547],
  fann: [14.6889, -17.4581],
  mermoz: [14.7078, -17.475],
  sacré: [14.7167, -17.4667],
  'sacré-cœur': [14.7167, -17.4667],
  liberté: [14.7167, -17.45],
  'grand yoff': [14.7375, -17.4436],
  'parcelles assainies': [14.7644, -17.4275],
  'cité keur gorgui': [14.7211, -17.4658],
  hann: [14.7167, -17.4167],
  'hann bel-air': [14.7167, -17.4167],
  'golf sud': [14.75, -17.4167],
  'grand dakar': [14.7167, -17.45],
  'cambérène': [14.7469, -17.4406],
  'ouest foire': [14.7458, -17.4864],
  'patte d\'oie': [14.7333, -17.45],
  'dieuppeul': [14.7167, -17.4444],
  'colobane': [14.6931, -17.4453],
  'sicap liberté': [14.7167, -17.4553],
  'zone b': [14.7167, -17.44],
  'zone a': [14.72, -17.44],
  foire: [14.7458, -17.4864],
  malika: [14.8064, -17.3358],
  'keur massar': [14.7856, -17.3197],
  yeumbeul: [14.7742, -17.3767],
  // Universités/grandes écoles citées en exemple dans le hero.
  ucad: [14.6928, -17.4611],
  'université cheikh anta diop': [14.6928, -17.4611],
  uam: [14.7311, -17.1875],
  'université amadou mahtar mbow': [14.7311, -17.1875],
  isep: [14.7311, -17.1875],
  'isep diamniadio': [14.7311, -17.1875],
}

export function findCityCoordinates(cityName: string): [number, number] | null {
  const key = cityName.trim().toLowerCase()
  return CITY_COORDINATES[key] ?? null
}
