<?php

namespace App\Exceptions;

use Exception;

class PlacesInsuffisantesException extends Exception
{
    protected $message = "Places insuffisantes pour cette réservation.";
}
