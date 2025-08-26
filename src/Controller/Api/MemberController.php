<?php

namespace App\Controller\Api;

use App\Entity\Member;
use App\Repository\MemberRepository;
use App\Repository\TeamRepository;
use App\Repository\ProjectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/members')]
class MemberController extends AbstractController
{
    public function __construct(
        private MemberRepository $memberRepository,
        private TeamRepository $teamRepository,
        private ProjectRepository $projectRepository,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('', name: 'api_members_list', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $projectId = $request->query->getInt('projectId', 0);
        if ($projectId > 0) {
            $members = $this->memberRepository->findByProject($projectId);
        } else {
            $members = $this->memberRepository->findAllOrderedByName();
        }
        return $this->json(
            $members,
            Response::HTTP_OK,
            [],
            ['groups' => ['member:read']]
        );
    }

    #[Route('/team/{teamId}', name: 'api_members_by_team', methods: ['GET'])]
    public function getByTeam(int $teamId): JsonResponse
    {
        $team = $this->teamRepository->find($teamId);
        if (!$team) {
            return $this->json(
                ['error' => 'Team not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        $members = $this->memberRepository->findByTeam($teamId);
        return $this->json(
            $members,
            Response::HTTP_OK,
            [],
            ['groups' => ['member:read', 'team:read']]
        );
    }

    #[Route('/{id}', name: 'api_members_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $member = $this->memberRepository->find($id);
        if (!$member) {
            return $this->json(
                ['error' => 'Member not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        return $this->json(
            $member,
            Response::HTTP_OK,
            [],
            ['groups' => ['member:read']]
        );
    }

    #[Route('', name: 'api_members_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $member = new Member();
        $member->setName($data['name']);
        $member->setEmail($data['email']);
        if (isset($data['jobPosition'])) {
            $member->setJobPosition($data['jobPosition']);
        }
        if (isset($data['jobDescription'])) {
            $member->setJobDescription($data['jobDescription']);
        }
        if (isset($data['skills'])) {
            $member->setSkills($data['skills']);
        }
        if (!isset($data['projectId'])) {
            return $this->json(
                ['error' => 'projectId is required'],
                Response::HTTP_BAD_REQUEST
            );
        }
        $project = $this->projectRepository->find((int)$data['projectId']);
        if (!$project) {
            return $this->json(
                ['error' => 'Project not found'],
                Response::HTTP_BAD_REQUEST
            );
        }
        $member->setProject($project);
        
        if (isset($data['teamId'])) {
            $team = $this->teamRepository->find($data['teamId']);
            if (!$team) {
                return $this->json(
                    ['error' => 'Team not found'],
                    Response::HTTP_BAD_REQUEST
                );
            }
            $member->setTeam($team);
        }

        $errors = $this->validator->validate($member);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->entityManager->persist($member);
            $this->entityManager->flush();

            return $this->json(
                $member,
                Response::HTTP_CREATED,
                [],
                ['groups' => ['member:read']]
            );
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Failed to create member', 'message' => $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/{id}', name: 'api_members_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $member = $this->memberRepository->find($id);
        if (!$member) {
            return $this->json(
                ['error' => 'Member not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $member->setName($data['name']);
        }
        if (isset($data['email'])) {
            $member->setEmail($data['email']);
        }
        if (isset($data['jobPosition'])) {
            $member->setJobPosition($data['jobPosition']);
        }
        if (isset($data['jobDescription'])) {
            $member->setJobDescription($data['jobDescription']);
        }
        if (isset($data['skills'])) {
            $member->setSkills($data['skills']);
        }
        if (isset($data['projectId'])) {
            $project = $this->projectRepository->find((int)$data['projectId']);
            if (!$project) {
                return $this->json(
                    ['error' => 'Project not found'],
                    Response::HTTP_BAD_REQUEST
                );
            }
            $member->setProject($project);
        }
        if (isset($data['teamId'])) {
            $team = $this->teamRepository->find($data['teamId']);
            if (!$team) {
                return $this->json(
                    ['error' => 'Team not found'],
                    Response::HTTP_BAD_REQUEST
                );
            }
            $member->setTeam($team);
        }

        $errors = $this->validator->validate($member);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->entityManager->flush();

            return $this->json(
                $member,
                Response::HTTP_OK,
                [],
                ['groups' => ['member:read']]
            );
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Failed to update member', 'message' => $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    #[Route('/{id}', name: 'api_members_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $member = $this->memberRepository->find($id);
        if (!$member) {
            return $this->json(
                ['error' => 'Member not found'],
                Response::HTTP_NOT_FOUND
            );
        }

        try {
            $this->entityManager->remove($member);
            $this->entityManager->flush();

            return $this->json(
                null,
                Response::HTTP_NO_CONTENT
            );
        } catch (\Exception $e) {
            return $this->json(
                ['error' => 'Failed to delete member', 'message' => $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
