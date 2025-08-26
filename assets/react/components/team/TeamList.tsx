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
      <div className="flex justify-between items-center mb-6">
        <TeamModal onSuccess={handleSuccess}>
          <Button>+ Create Team</Button>
        </TeamModal>
      </div>
      
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-gray-500 py-8">
                  No teams found. Use "Create Team" to add your first team.
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.id}</TableCell>
                  <TableCell>{team.name}</TableCell>
                  <TableCell className="text-right">
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
  );
}

export default TeamList;
