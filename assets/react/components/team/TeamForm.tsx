import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Team } from '../ticket/types';
import { TeamService } from '../../services/teamService';
import { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';

type TeamFormData = {
  name: string;
};

type TeamFormProps = {
  isEdit?: boolean;
};

export function TeamForm({ isEdit = false }: TeamFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedProjectId } = useProject();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TeamFormData>();

  useEffect(() => {
    if (isEdit && id) {
      const fetchTeam = async () => {
        try {
          const team = await TeamService.getTeam(parseInt(id));
          setValue('name', team.name);
        } catch (error) {
          console.error('Error fetching team:', error);
        }
      };
      fetchTeam();
    }
  }, [isEdit, id, setValue]);

  const onSubmit = async (data: TeamFormData) => {
    setIsLoading(true);
    try {
      if (isEdit && id) {
        await TeamService.updateTeam(parseInt(id), data.name);
      } else {
        if (!selectedProjectId) {
          console.error('No project selected. Cannot create a team without a project.');
          return;
        }
        await TeamService.createTeam(data.name, selectedProjectId);
      }
      navigate('/teams');
    } catch (error) {
      console.error('Error saving team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Team' : 'Create New Team'}
      </h1>
      
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
            onClick={() => navigate('/teams')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Team'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TeamForm;
