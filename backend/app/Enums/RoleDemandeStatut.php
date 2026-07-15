<?php

namespace App\Enums;

enum RoleDemandeStatut: string
{
    case EnAttente = 'en_attente';
    case Validee = 'validee';
    case Rejetee = 'rejetee';
}
