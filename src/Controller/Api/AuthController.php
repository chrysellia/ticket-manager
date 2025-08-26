<?php

namespace App\Controller\Api;

use App\Repository\MemberRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_auth_')]
class AuthController
{
    public function __construct(private MemberRepository $memberRepository) {}

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, SessionInterface $session): Response
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return new JsonResponse(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        $email = $data['email'] ?? null;
        if (!$email) {
            return new JsonResponse(['error' => 'Email is required'], Response::HTTP_BAD_REQUEST);
        }

        $member = $this->memberRepository->findOneBy(['email' => $email]);
        if (!$member) {
            return new JsonResponse(['error' => 'Invalid credentials'], Response::HTTP_UNAUTHORIZED);
        }

        // Minimal session-based auth: store member id in session
        $session->set('user_id', $member->getId());

        return new JsonResponse([
            'id' => $member->getId(),
            'name' => $member->getName(),
            'email' => $member->getEmail(),
        ]);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(SessionInterface $session): Response
    {
        $userId = $session->get('user_id');
        if (!$userId) {
            return new JsonResponse(['error' => 'Unauthenticated'], Response::HTTP_UNAUTHORIZED);
        }
        $member = $this->memberRepository->find($userId);
        if (!$member) {
            $session->remove('user_id');
            return new JsonResponse(['error' => 'Unauthenticated'], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse([
            'id' => $member->getId(),
            'name' => $member->getName(),
            'email' => $member->getEmail(),
        ]);
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(SessionInterface $session): Response
    {
        $session->invalidate();
        return new JsonResponse(['ok' => true]);
    }
}
