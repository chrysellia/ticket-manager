import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil } from 'lucide-react';
import { Team } from '../ticket/types';
import { TeamService } from '../../services/teamService';
import { TeamModal } from './TeamModal';

export function TeamList() {
  const [teams, setTeams] = useState<Team[]>([]);

  const fetchTeams = async () => {
    try {
      const data = await TeamService.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSuccess = () => {
    fetchTeams();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <TeamModal onSuccess={handleSuccess}>
          <Button>Create Team</Button>
        </TeamModal>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default TeamList;
