<?php

namespace App\Enums;

enum TripStatut: string
{
    case Publie = 'publie';
    case EnCours = 'en_cours';
    case Termine = 'termine';
    case Annule = 'annule';
}
