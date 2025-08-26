import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Team } from '../ticket/types';
import { TeamService } from '../../services/teamService';
import { useProject } from '../../context/ProjectContext';

type TeamFormData = {
  name: string;
};

type TeamModalProps = {
  team?: Team;
  onSuccess: () => void;
  children: React.ReactNode;
};

export function TeamModal({ team, onSuccess, children }: TeamModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedProjectId } = useProject();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TeamFormData>();

  useEffect(() => {
    if (isOpen && team) {
      reset({ name: team.name });
    } else if (isOpen) {
      reset({ name: '' });
    }
  }, [isOpen, team, reset]);

  const onSubmit = async (data: TeamFormData) => {
    setIsLoading(true);
    try {
      if (team) {
        await TeamService.updateTeam(team.id, data.name, selectedProjectId ?? undefined);
      } else {
        if (!selectedProjectId) throw new Error('No project selected');
        await TeamService.createTeam(data.name, selectedProjectId);
      }
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{team ? 'Edit Team' : 'Create New Team'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Team Name
            </label>
            <Input
              id="name"
              {...register('name', { required: 'Team name is required' })}
              placeholder="Enter team name"
              className={`${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
