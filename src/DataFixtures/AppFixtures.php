<?php

namespace App\DataFixtures;

use App\Entity\Member;
use App\Entity\Project;
use App\Entity\Task;
use App\Entity\Team;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory as FakerFactory;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $faker = FakerFactory::create();

        $jobPositions = [
            'Frontend Developer','Backend Developer','Full Stack Developer','QA Engineer','Product Manager',
            'UX Designer','DevOps Engineer','Data Engineer','Mobile Developer','Engineering Manager'
        ];

        $skillPool = [
            'react','vue','angular','typescript','javascript','php','symfony','laravel','node','express',
            'docker','kubernetes','postgres','mysql','redis','aws','gcp','ci/cd','testing','qa','ux','ui','graphql','rest'
        ];

        $projects = [];
        $projectCount = 2;
        for ($p = 0; $p < $projectCount; $p++) {
            $project = (new Project())
                ->setName($faker->unique()->company())
                ->setDescription($faker->optional(0.7)->paragraphs($faker->numberBetween(1, 3), true));
            $manager->persist($project);
            $projects[] = $project;
        }

        foreach ($projects as $project) {
            // Teams per project: 2-4
            $teams = [];
            $teamCount = $faker->numberBetween(2, 4);
            for ($t = 0; $t < $teamCount; $t++) {
                $team = (new Team())
                    ->setName($faker->unique()->catchPhrase())
                    ->setProject($project);
                $manager->persist($team);
                $teams[] = $team;
            }

            // Members per project: 8-15
            $members = [];
            $memberCount = $faker->numberBetween(8, 15);
            for ($m = 0; $m < $memberCount; $m++) {
                $team = $teams[$m % count($teams)];
                // random skills (3-7 unique)
                $skills = $faker->randomElements($skillPool, $faker->numberBetween(3, 7));

                $member = (new Member())
                    ->setName($faker->name())
                    ->setEmail($faker->unique()->safeEmail())
                    ->setTeam($team)
                    ->setProject($project)
                    ->setJobPosition($faker->randomElement($jobPositions))
                    ->setJobDescription($faker->optional(0.6)->sentences($faker->numberBetween(1, 3), true))
                    ->setSkills(implode(',', $skills));
                $manager->persist($member);
                $members[] = $member;
            }

            // Tasks per project: 15-35
            $taskCount = $faker->numberBetween(15, 35);
            for ($k = 0; $k < $taskCount; $k++) {
                $status = $faker->randomElement([
                    Task::STATUS_BACKLOG,
                    Task::STATUS_TODO,
                    Task::STATUS_IN_PROGRESS,
                    Task::STATUS_DONE,
                ]);
                $team = $teams[$k % count($teams)];
                $assignee = $members[$k % count($members)];

                $task = (new Task())
                    ->setTitle($faker->sentence(nbWords: $faker->numberBetween(2, 6)))
                    ->setDescription($faker->optional(0.8)->paragraphs($faker->numberBetween(1, 3), true))
                    ->setStatus($status)
                    ->setPriority($faker->numberBetween(1, 5))
                    ->setProject($project)
                    ->setTeam($team)
                    ->setAssignedTo($assignee);

                // 40% have a due date within next 30 days
                if ($faker->boolean(40)) {
                    $task->setDueDate($faker->dateTimeBetween('now', '+30 days'));
                }

                $manager->persist($task);
            }
        }

        $manager->flush();
    }
}
