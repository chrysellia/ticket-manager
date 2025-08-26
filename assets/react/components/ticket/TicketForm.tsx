import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ticket, Priority, Team } from './types';
import { TeamService } from '../../services/teamService';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { useProject } from '../../context/ProjectContext';

type TicketFormData = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> & {
  teamId?: number;
};

type TicketFormProps = {
  initialValues: TicketFormData;
  onSubmit: (data: TicketFormData) => void;
  onCancel: () => void;
};

export function TicketForm({ initialValues, onSubmit, onCancel }: TicketFormProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const { selectedProjectId } = useProject();

  const { register, handleSubmit, setValue, watch } = useForm<TicketFormData>({
    defaultValues: {
      ...initialValues,
      teamId: initialValues.teamId || (initialValues.team?.id as number | undefined),
    },
  });

  const status = watch('status');
  const priority = watch('priority');
  const teamId = watch('teamId');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await TeamService.getTeams(selectedProjectId ?? undefined);
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [selectedProjectId]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      if (!selectedProjectId) {
        console.error('No project selected. Cannot create a team without a project.');
        return;
      }
      const newTeam = await TeamService.createTeam(newTeamName, selectedProjectId);
      setTeams(prevTeams => [...prevTeams, newTeam]);
      setValue('teamId', newTeam.id, { shouldDirty: true });
      setNewTeamName('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <Input
          id="title"
          {...register('title', { required: 'Title is required' })}
          placeholder="Enter ticket title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter ticket description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as Ticket['status'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <Select
            value={priority.toString()}
            onValueChange={(value: any) => setValue('priority', value as Priority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Low (1)</SelectItem>
              <SelectItem value="2">Low-Medium (2)</SelectItem>
              <SelectItem value="3">Medium (3)</SelectItem>
              <SelectItem value="4">Medium-High (4)</SelectItem>
              <SelectItem value="5">High (5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Team</Label>
          <div className="flex gap-2">
            <Select
              value={teamId?.toString() || ''}
              onValueChange={(value) => {
                const teamId = value ? parseInt(value) : undefined;
                setValue('teamId', teamId, { shouldDirty: true });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No team</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="icon">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input
                      id="teamName"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Enter team name"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Team</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialValues.title ? 'Update' : 'Create'} Ticket
          </Button>
        </div>
      </div>
    </form>
  );
}
