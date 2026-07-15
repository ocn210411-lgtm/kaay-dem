<?php

namespace App\Enums;

enum ReportStatut: string
{
    case Ouvert = 'ouvert';
    case EnCours = 'en_cours';
    case Resolu = 'resolu';
    case Rejete = 'rejete';
}
