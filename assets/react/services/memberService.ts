import { CreateMemberDto, Member, UpdateMemberDto } from '../types/member';

const API_BASE_URL = '/api/members';

export const MemberService = {
  async getMembers(projectId?: number): Promise<Member[]> {
    const url = new URL(API_BASE_URL, window.location.origin);
    if (projectId) url.searchParams.set('projectId', String(projectId));
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch members');
    }
    return response.json();
  },

  async getMembersByTeam(teamId: number): Promise<Member[]> {
    const response = await fetch(`${API_BASE_URL}/team/${teamId}`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }
    return response.json();
  },

  async getMember(id: number): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/${id}`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch member');
    }
    return response.json();
  },

  async createMember(data: CreateMemberDto): Promise<Member> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create member');
    }

    return response.json();
  },

  async updateMember(id: number, data: UpdateMemberDto): Promise<Member> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update member');
    }

    return response.json();
  },

  async deleteMember(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete member');
    }
  },
};
