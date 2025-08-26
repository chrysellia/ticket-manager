<?php
namespace App\Service;

use App\Entity\Member;
use App\Repository\MemberRepository;
use App\Repository\TaskRepository;

class AssignmentSuggester
{
    public function __construct(
        private MemberRepository $memberRepository,
        private TaskRepository $taskRepository
    ) {}

    /**
     * Suggest the best member for a task based on title/description and optional project.
     */
    public function suggest(string $title, string $description, ?int $projectId = null): ?Member
    {
        $text = trim($title.' '.$description);
        if ($text === '') {
            return null;
        }
        $tokens = $this->tokenize(mb_strtolower($text));

        $candidates = $projectId
            ? $this->memberRepository->findByProject($projectId)
            : $this->memberRepository->findAllOrderedByName();

        $best = null; $bestScore = -INF;
        foreach ($candidates as $member) {
            $skills = $this->extractSkills($member);
            $skillTokens = array_map(fn($s) => mb_strtolower($s), $skills);
            $skillScore = $this->overlapScore($tokens, $skillTokens);

            $historyScore = $this->historyScore($member, $tokens, $projectId);
            $availabilityScore = $this->availabilityScore($member);

            $score = 0.6 * $skillScore + 0.3 * $historyScore + 0.1 * $availabilityScore;
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $member;
            }
        }

        return $best;
    }

    private function tokenize(string $txt): array
    {
        $txt = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $txt);
        $parts = preg_split('/\s+/u', $txt, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $stop = ['the','and','or','a','an','for','to','of','in','on','with','by','is','are','this','that'];
        return array_values(array_diff($parts, $stop));
    }

    private function overlapScore(array $taskTokens, array $skillTokens): float
    {
        if (!$taskTokens || !$skillTokens) return 0.0;
        $set = array_flip($skillTokens);
        $hits = 0;
        foreach ($taskTokens as $t) {
            if (isset($set[$t])) $hits++;
        }
        return $hits / max(1, count($taskTokens));
    }

    private function historyScore(Member $member, array $taskTokens, ?int $projectId): float
    {
        // Very lightweight heuristic: count of open tasks assigned to member that contain any token in title
        // Normalize to [0,1] by capping at, say, 5 matches
        $count = 0;
        $tasks = $projectId
            ? $this->taskRepository->findBy(['assignedTo' => $member, 'project' => $projectId])
            : $this->taskRepository->findBy(['assignedTo' => $member]);
        foreach ($tasks as $t) {
            $title = mb_strtolower((string) $t->getTitle());
            foreach ($taskTokens as $tok) {
                if ($tok !== '' && str_contains($title, $tok)) { $count++; break; }
            }
        }
        return min(1.0, $count / 5.0);
    }

    private function availabilityScore(Member $member): float
    {
        // Fewer assigned open tasks => higher availability. We don't have status filter here, so just invert count.
        $count = count($this->taskRepository->findBy(['assignedTo' => $member]));
        // Map 0->1.0, 10+ -> ~0.0
        return 1.0 / (1.0 + min(10, $count));
    }

    /**
     * Extract skills from Member: comma-separated skills field, plus words from job position/description.
     * Keep it simple to stay lightweight.
     */
    private function extractSkills(Member $m): array
    {
        $skills = [];
        $str = (string) $m->getSkills();
        if ($str !== '') {
            $skills = array_merge($skills, array_filter(array_map('trim', explode(',', $str))));
        }
        $jobPos = (string) $m->getJobPosition();
        if ($jobPos !== '') {
            $skills = array_merge($skills, array_filter(array_map('trim', preg_split('/\s+/', $jobPos) ?: [])));
        }
        $jobDesc = (string) $m->getJobDescription();
        if ($jobDesc !== '') {
            $skills = array_merge($skills, array_filter(array_map('trim', preg_split('/\s+/', $jobDesc) ?: [])));
        }
        return array_values(array_unique($skills));
    }
}
