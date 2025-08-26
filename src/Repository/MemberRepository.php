<?php

namespace App\Repository;

use App\Entity\Member;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Member>
 */
class MemberRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Member::class);
    }

    public function save(Member $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Member $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return Member[] Returns an array of Member objects
     */
    public function findAllOrderedByName()
    {
        return $this->createQueryBuilder('m')
            ->orderBy('m.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Member[] Returns an array of Member objects for a specific team
     */
    public function findByTeam($teamId)
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.team = :teamId')
            ->setParameter('teamId', $teamId)
            ->orderBy('m.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Member[] Returns members for a specific project ordered by name
     */
    public function findByProject(int $projectId): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.project = :pid')
            ->setParameter('pid', $projectId)
            ->orderBy('m.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}

