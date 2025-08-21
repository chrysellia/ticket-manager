<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DefaultController extends AbstractController
{
    #[Route('/', name: 'app_default')]
    public function index(): Response
    {
        return $this->redirectToRoute('app_ticket_board');
    }
    
    #[Route('/board', name: 'app_ticket_board')]
    public function ticketBoard(): Response
    {
        return $this->render('ticket/board.html.twig');
    }
}
