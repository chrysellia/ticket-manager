import { Team } from '../components/ticket/types';

export const TeamService = {
  async getTeams(projectId?: number): Promise<Team[]> {
    const url = new URL('/api/teams', window.location.origin);
    if (projectId) url.searchParams.set('projectId', String(projectId));
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    return response.json();
  },

  async getTeam(id: number): Promise<Team> {
    const response = await fetch(`/api/teams/${id}`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch team');
    }
    return response.json();
  },

  async createTeam(name: string, projectId: number): Promise<Team> {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, projectId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create team');
    }
    return response.json();
  },

  async updateTeam(id: number, name: string, projectId?: number): Promise<Team> {
    const response = await fetch(`/api/teams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(projectId ? { name, projectId } : { name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update team');
    }
    return response.json();
  },

  async deleteTeam(id: number): Promise<void> {
    const response = await fetch(`/api/teams/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete team');
    }
  },
};
