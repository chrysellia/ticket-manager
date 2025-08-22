<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends AbstractController
{
    #[Route('/{reactRouting}', name: 'app_home', requirements: ['reactRouting' => '^(?!api|_wdt|_profiler).+'], defaults: ['reactRouting' => null])]
    public function index(): Response
    {
        return $this->render('ticket/board.html.twig');
    }
}
