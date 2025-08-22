<?php

namespace App\Controller\Api;

use App\Entity\Team;
use App\Repository\TeamRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/teams')]
class TeamController extends AbstractController
{
    public function __construct(
        private TeamRepository $teamRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('/{id}', name: 'api_teams_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $team = $this->teamRepository->find($id);
        
        if (!$team) {
            return $this->json(
                ['error' => 'Team not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        return $this->json(
            $team,
            Response::HTTP_OK,
            [],
            ['groups' => ['team:read']]
        );
    }

    #[Route('/{id}', name: 'api_teams_update', methods: ['PUT'])]
    public function updateTeam(int $id, Request $request): JsonResponse
    {
        $team = $this->teamRepository->find($id);
        
        if (!$team) {
            return $this->json(
                ['error' => 'Team not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $team->setName($data['name']);
        }
        
        $errors = $this->validator->validate($team);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->entityManager->flush();
            
            return $this->json(
                $team,
                Response::HTTP_OK,
                [],
                ['groups' => ['team:read']]
            );
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Failed to update team', 'message' => $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/{id}', name: 'api_teams_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $team = $this->teamRepository->find($id);
        
        if (!$team) {
            return $this->json(
                ['error' => 'Team not found'], 
                Response::HTTP_NOT_FOUND
            );
        }

        try {
            $this->entityManager->remove($team);
            $this->entityManager->flush();
            
            return $this->json(
                null,
                Response::HTTP_NO_CONTENT
            );
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Failed to delete team', 'message' => $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('', name: 'api_teams_list', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $teams = $this->teamRepository->findAllOrderedByName();
        return $this->json(
            $teams,
            Response::HTTP_OK,
            [],
            ['groups' => ['team:read']]
        );
    }

    #[Route('', name: 'api_teams_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $team = $this->serializer->deserialize($request->getContent(), Team::class, 'json');
        
        $errors = $this->validator->validate($team);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->entityManager->persist($team);
            $this->entityManager->flush();

            return $this->json(
                $team,
                Response::HTTP_CREATED,
                [],
                ['groups' => ['team:read']]
            );
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Failed to create team', 'message' => $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
