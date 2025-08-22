import { Team } from '../components/ticket/types';

export const TeamService = {
  async getTeams(): Promise<Team[]> {
    const response = await fetch('/api/teams');
    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    return response.json();
  },

  async getTeam(id: number): Promise<Team> {
    const response = await fetch(`/api/teams/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch team');
    }
    return response.json();
  },

  async createTeam(name: string): Promise<Team> {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create team');
    }
    return response.json();
  },

  async updateTeam(id: number, name: string): Promise<Team> {
    const response = await fetch(`/api/teams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
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
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete team');
    }
  },
};
