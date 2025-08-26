import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil } from 'lucide-react';
import { Team } from '../ticket/types';
import { TeamService } from '../../services/teamService';
import { TeamModal } from './TeamModal';
import { useProject } from '../../context/ProjectContext';

export function TeamList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const { selectedProjectId } = useProject();

  const fetchTeams = async () => {
    try {
      const data = await TeamService.getTeams(selectedProjectId ?? undefined);
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [selectedProjectId]);

  const handleSuccess = () => {
    fetchTeams();
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <TeamModal onSuccess={handleSuccess}>
          <Button>+ Create Team</Button>
        </TeamModal>
      </div>
      
      <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</TableHead>
                  <TableHead className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 text-center">
                      No teams found. Use "Create Team" to add your first team.
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{team.name}</TableCell>
                      <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <TeamModal team={team} onSuccess={handleSuccess}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mr-2"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TeamModal>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamList;
