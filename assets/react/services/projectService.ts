import { CreateProjectDto, Project, UpdateProjectDto } from '../types/project';

const API_BASE_URL = '/api/projects';

export const ProjectService = {
  async getProjects(): Promise<Project[]> {
    const res = await fetch(API_BASE_URL, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProject(id: number): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async createProject(data: CreateProjectDto): Promise<Project> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async updateProject(id: number, data: UpdateProjectDto): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },
};
