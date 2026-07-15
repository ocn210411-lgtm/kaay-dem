<?php

namespace App\Enums;

enum ReservationStatut: string
{
    case EnAttente = 'en_attente';
    case Confirmee = 'confirmee';
    case Terminee = 'terminee';
    case Annulee = 'annulee';
    case Refusee = 'refusee';
}
