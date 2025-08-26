<?php

namespace App\Controller\Api;

use App\Entity\Task;
use App\Repository\TaskRepository;
use App\Repository\ProjectRepository;
use App\Repository\TeamRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/tasks')]
class TaskApiController extends AbstractController
{
    public function __construct(
        private TaskRepository $taskRepository,
        private ProjectRepository $projectRepository,
        private TeamRepository $teamRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('', name: 'api_task_index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $projectId = $request->query->getInt('projectId', 0);
        if ($projectId > 0) {
            $tasks = $this->taskRepository->findByProject($projectId);
        } else {
            $tasks = $this->taskRepository->findAll();
        }
        
        $data = $this->serializer->serialize($tasks, 'json', [
            'groups' => 'task:read',
            'json_encode_options' => JSON_PRETTY_PRINT
        ]);
        
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_task_show', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        
        if (!$task) {
            return $this->json(['error' => 'Task not found'], Response::HTTP_NOT_FOUND);
        }

        $data = $this->serializer->serialize($task, 'json', [
            'groups' => 'task:read',
            'json_encode_options' => JSON_PRETTY_PRINT
        ]);
        
        return new JsonResponse($data, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'api_task_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $task = new Task();
            if (!isset($data['title'])) {
                return $this->json(['error' => 'title is required'], Response::HTTP_BAD_REQUEST);
            }
            $task->setTitle($data['title']);
            if (isset($data['description'])) {
                $task->setDescription($data['description']);
            }
            if (isset($data['status'])) {
                $task->setStatus($data['status']);
            }
            if (isset($data['priority'])) {
                $task->setPriority((int)$data['priority']);
            }
            if (isset($data['dueDate'])) {
                $task->setDueDate(new \DateTime($data['dueDate']));
            }
            if (!isset($data['projectId'])) {
                return $this->json(['error' => 'projectId is required'], Response::HTTP_BAD_REQUEST);
            }
            $project = $this->projectRepository->find((int)$data['projectId']);
            if (!$project) {
                return $this->json(['error' => 'Project not found'], Response::HTTP_BAD_REQUEST);
            }
            $task->setProject($project);
            if (isset($data['teamId'])) {
                $team = $this->teamRepository->find((int)$data['teamId']);
                if (!$team) {
                    return $this->json(['error' => 'Team not found'], Response::HTTP_BAD_REQUEST);
                }
                $task->setTeam($team);
            }

            $errors = $this->validator->validate($task);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return $this->json(
                    ['errors' => $errorMessages],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $this->entityManager->persist($task);
            $this->entityManager->flush();

            $data = $this->serializer->serialize($task, 'json', [
                'groups' => 'task:read',
                'json_encode_options' => JSON_PRETTY_PRINT
            ]);
            
            return new JsonResponse($data, Response::HTTP_CREATED, [], true);
            
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Invalid data provided', 'message' => $e->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/{id}', name: 'api_task_update', methods: ['PUT'])]
    public function update(Request $request, string $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        
        if (!$task) {
            return $this->json(['error' => 'Task not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $data = json_decode($request->getContent(), true);
            if (isset($data['title'])) {
                $task->setTitle($data['title']);
            }
            if (isset($data['description'])) {
                $task->setDescription($data['description']);
            }
            if (isset($data['status'])) {
                $task->setStatus($data['status']);
            }
            if (isset($data['priority'])) {
                $task->setPriority((int)$data['priority']);
            }
            if (isset($data['dueDate'])) {
                $task->setDueDate(new \DateTime($data['dueDate']));
            }
            if (isset($data['projectId'])) {
                $project = $this->projectRepository->find((int)$data['projectId']);
                if (!$project) {
                    return $this->json(['error' => 'Project not found'], Response::HTTP_BAD_REQUEST);
                }
                $task->setProject($project);
            }
            if (isset($data['teamId'])) {
                $team = $this->teamRepository->find((int)$data['teamId']);
                if (!$team) {
                    return $this->json(['error' => 'Team not found'], Response::HTTP_BAD_REQUEST);
                }
                $task->setTeam($team);
            }

            $errors = $this->validator->validate($task);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                return $this->json(
                    ['errors' => $errorMessages],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $this->entityManager->flush();

            $data = $this->serializer->serialize($task, 'json', [
                'groups' => 'task:read',
                'json_encode_options' => JSON_PRETTY_PRINT
            ]);
            
            return new JsonResponse($data, Response::HTTP_OK, [], true);
            
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Invalid data provided', 'message' => $e->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }
    }

    #[Route('/{id}', name: 'api_task_delete', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);
        
        if (!$task) {
            return $this->json(['error' => 'Task not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
