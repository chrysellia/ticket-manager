<?php

namespace App\Controller\Api;

use App\Entity\Task;
use App\Repository\TaskRepository;
use App\Repository\ProjectRepository;
use App\Repository\MemberRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Service\AssignmentSuggester;

#[Route('/api/tickets')]
class TicketApiController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private TaskRepository $taskRepository,
        private ProjectRepository $projectRepository,
        private MemberRepository $memberRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private AssignmentSuggester $assignmentSuggester
    ) {}

    #[Route('', name: 'api_tickets_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $projectId = $request->query->getInt('projectId', 0);
        if ($projectId > 0) {
            $tasks = $this->taskRepository->findByProject($projectId);
        } else {
            $tasks = $this->taskRepository->findAll();
        }
        return $this->json($tasks, Response::HTTP_OK, [], ['groups' => ['task:read']]);
    }

    #[Route('', name: 'api_tickets_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $task = $this->serializer->deserialize(
            $request->getContent(),
            Task::class,
            'json',
            ['groups' => ['task:write']]
        );

        if (isset($data['projectId'])) {
            $project = $this->projectRepository->find((int) $data['projectId']);
            if (!$project) {
                return $this->json(['error' => 'Project not found'], Response::HTTP_BAD_REQUEST);
            }
            $task->setProject($project);
        }

        // Handle assignedTo from assignedToId (optional, can clear)
        if (array_key_exists('assignedToId', $data)) {
            $assignedToId = $data['assignedToId'];
            if ($assignedToId === null || $assignedToId === '') {
                $task->setAssignedTo(null);
            } else {
                $member = $this->memberRepository->find((int) $assignedToId);
                if (!$member) {
                    return $this->json(['error' => 'Assigned member not found'], Response::HTTP_BAD_REQUEST);
                }
                $task->setAssignedTo($member);
            }
        }

        if (!$task->getStatus()) {
            $task->setStatus(Task::STATUS_TODO);
        }

        // Handle assignedTo from assignedToId (optional)
        if (array_key_exists('assignedToId', $data)) {
            $assignedToId = $data['assignedToId'];
            if ($assignedToId === null || $assignedToId === '' ) {
                $task->setAssignedTo(null);
            } else {
                $member = $this->memberRepository->find((int) $assignedToId);
                if (!$member) {
                    return $this->json(['error' => 'Assigned member not found'], Response::HTTP_BAD_REQUEST);
                }
                $task->setAssignedTo($member);
            }
        }

        $errors = $this->validator->validate($task);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $this->json($task, Response::HTTP_CREATED, [], ['groups' => ['task:read']]);
    }

    #[Route('/suggest-assignee', name: 'api_tickets_suggest_assignee', methods: ['POST'])]
    public function suggestAssignee(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $title = (string) ($data['title'] ?? '');
        $description = (string) ($data['description'] ?? '');
        $projectId = isset($data['projectId']) && $data['projectId'] !== '' ? (int) $data['projectId'] : null;

        if (trim($title . ' ' . $description) === '') {
            return $this->json(['member' => null], Response::HTTP_OK);
        }

        $member = $this->assignmentSuggester->suggest($title, $description, $projectId);
        if (!$member) {
            return $this->json(['member' => null], Response::HTTP_OK);
        }

        return $this->json([
            'member' => [
                'id' => $member->getId(),
                'name' => $member->getName(),
            ]
        ], Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_tickets_update', methods: ['PUT'])]
    public function update(Task $task, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $this->serializer->deserialize(
            $request->getContent(),
            Task::class,
            'json',
            [
                'groups' => ['task:write'],
                'object_to_populate' => $task,
            ]
        );

        if (isset($data['projectId'])) {
            $project = $this->projectRepository->find((int) $data['projectId']);
            if (!$project) {
                return $this->json(['error' => 'Project not found'], Response::HTTP_BAD_REQUEST);
            }
            $task->setProject($project);
        }

        // Handle assignedTo from assignedToId (optional)
        if (array_key_exists('assignedToId', $data)) {
            $assignedToId = $data['assignedToId'];
            if ($assignedToId === null || $assignedToId === '' ) {
                $task->setAssignedTo(null);
            } else {
                $member = $this->memberRepository->find((int) $assignedToId);
                if (!$member) {
                    return $this->json(['error' => 'Assigned member not found'], Response::HTTP_BAD_REQUEST);
                }
                $task->setAssignedTo($member);
            }
        }

        $errors = $this->validator->validate($task);
        if (count($errors) > 0) {
            return $this->json(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return $this->json($task, Response::HTTP_OK, [], ['groups' => ['task:read']]);
    }

    #[Route('/{id}', name: 'api_tickets_delete', methods: ['DELETE'])]
    public function delete(Task $task): JsonResponse
    {
        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
