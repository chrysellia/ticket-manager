<?php

namespace App\Controller\Api;

use App\Entity\Project;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/projects')]
class ProjectController extends AbstractController
{
    public function __construct(
        private ProjectRepository $projectRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('', name: 'api_projects_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $projects = $this->projectRepository->findAllOrderedByName();

        $data = $this->serializer->serialize($projects, 'json', [
            'groups' => 'project:read',
            'json_encode_options' => JSON_PRETTY_PRINT,
        ]);

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_projects_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            return $this->json(['error' => 'Project not found'], Response::HTTP_NOT_FOUND);
        }

        $data = $this->serializer->serialize($project, 'json', [
            'groups' => 'project:read',
            'json_encode_options' => JSON_PRETTY_PRINT,
        ]);

        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'api_projects_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $project = $this->serializer->deserialize(
                $request->getContent(),
                Project::class,
                'json',
                ['groups' => 'project:write']
            );

            $errors = $this->validator->validate($project);
            if (count($errors) > 0) {
                return $this->json($errors, Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->persist($project);
            $this->entityManager->flush();

            $data = $this->serializer->serialize($project, 'json', [
                'groups' => 'project:read',
                'json_encode_options' => JSON_PRETTY_PRINT,
            ]);
            return new JsonResponse($data, Response::HTTP_CREATED, [], true);
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Invalid data provided', 'message' => $e->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/{id}', name: 'api_projects_update', methods: ['PUT'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            return $this->json(['error' => 'Project not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->serializer->deserialize(
                $request->getContent(),
                Project::class,
                'json',
                [
                    'object_to_populate' => $project,
                    'groups' => 'project:write',
                ]
            );

            $errors = $this->validator->validate($project);
            if (count($errors) > 0) {
                return $this->json($errors, Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->flush();

            $data = $this->serializer->serialize($project, 'json', [
                'groups' => 'project:read',
                'json_encode_options' => JSON_PRETTY_PRINT,
            ]);
            return new JsonResponse($data, Response::HTTP_OK, [], true);
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Invalid data provided', 'message' => $e->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/{id}', name: 'api_projects_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $project = $this->projectRepository->find($id);
        if (!$project) {
            return $this->json(['error' => 'Project not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($project);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
