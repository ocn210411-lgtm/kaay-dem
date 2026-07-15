<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\DriverRequestRequest;
use App\Http\Requests\UpdateDriverProfileRequest;
use App\Http\Resources\DriverProfileResource;
use App\Models\DriverProfile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class DriverRequestController extends Controller
{
    public function store(DriverRequestRequest $request)
    {
        $user = $request->user();

        if ($user->driverProfile()->exists()) {
            throw ValidationException::withMessages([
                'statut' => ["Une demande existe déjà pour cet utilisateur."],
            ]);
        }

        $data = $request->validated();

        // Les documents sont stockés sur le disque public, dans des dossiers dédiés ;
        // seuls les chemins (pas les fichiers bruts) sont persistés en base.
        foreach (['permis_recto', 'permis_verso', 'vehicule_photo', 'carte_grise', 'assurance'] as $document) {
            $data[$document] = $request->file($document)->store('driver-documents/'.$document, 'public');
        }

        $profile = DriverProfile::create([
            ...$data,
            'user_id' => $user->id,
            'statut' => 'en_attente',
        ]);

        return new DriverProfileResource($profile);
    }

    /**
     * Permet à un conducteur (validé, en attente, ou rejeté) de modifier son
     * propre dossier — véhicule, permis, documents — plutôt que de repasser
     * par le formulaire "Devenir conducteur" (qui refuse toute nouvelle
     * demande une fois qu'un profil existe déjà, cf. store() ci-dessus).
     *
     * Modifier les informations d'identité (numéro/date de permis, permis
     * recto/verso, carte grise, assurance) remet le dossier "en attente"
     * pour qu'un administrateur le revérifie ; modifier uniquement les
     * champs du véhicule (marque, modèle, couleur, immatriculation, photo)
     * n'affecte pas le statut de validation en cours.
     */
    public function update(UpdateDriverProfileRequest $request)
    {
        $user = $request->user();
        $profile = $user->driverProfile;

        if (! $profile) {
            abort(404, "Aucun dossier conducteur n'existe pour ce compte.");
        }

        $data = $request->validated();
        $identiteModifiee = false;

        foreach (['permis_recto', 'permis_verso', 'vehicule_photo', 'carte_grise', 'assurance'] as $document) {
            if ($request->hasFile($document)) {
                if ($profile->$document) {
                    Storage::disk('public')->delete($profile->$document);
                }
                $data[$document] = $request->file($document)->store('driver-documents/'.$document, 'public');
                // La photo du véhicule n'est pas un document d'identité :
                // seuls les 4 autres déclenchent une revérification.
                if ($document !== 'vehicule_photo') {
                    $identiteModifiee = true;
                }
            }
        }

        // Comparaison à la valeur ACTUELLE, pas simple présence de la clé :
        // le formulaire d'édition envoie toujours numero_permis (champ texte
        // obligatoire), même quand seul le véhicule a changé — se contenter
        // de tester array_key_exists() remettrait le dossier "en attente" à
        // chaque modification, y compris un simple changement de couleur.
        if (array_key_exists('numero_permis', $data) && $data['numero_permis'] !== $profile->numero_permis) {
            $identiteModifiee = true;
        }
        if (
            array_key_exists('date_expiration_permis', $data)
            && $data['date_expiration_permis'] !== $profile->date_expiration_permis?->toDateString()
        ) {
            $identiteModifiee = true;
        }

        if ($identiteModifiee) {
            $data['statut'] = 'en_attente';
            $data['motif_rejet'] = null;
            $data['valide_at'] = null;
            $data['valide_par'] = null;
        }

        $profile->update($data);

        return new DriverProfileResource($profile->fresh());
    }
}
