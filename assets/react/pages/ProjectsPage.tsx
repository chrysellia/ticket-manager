import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { ProjectService } from '../services/projectService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, setSelectedProjectId, refreshProjects, loading } = useProject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (id: number) => {
    setSelectedProjectId(id);
    navigate('/tickets');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const created = await ProjectService.createProject({ name: name.trim(), description: description || undefined });
      await refreshProjects();
      setSelectedProjectId(created.id);
      setIsDialogOpen(false);
      setName('');
      setDescription('');
      navigate('/tickets');
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-1">Choose a project to work on or create a new one.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button">New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projName">Name</Label>
                <Input id="projName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projDesc">Description (optional)</Label>
                <Input id="projDesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting || !name.trim()}>{submitting ? 'Creating...' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-sm text-gray-500">Loading projects...</div>
        ) : (
          <>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className="text-left rounded-lg border bg-white hover:shadow-md transition p-4 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="font-semibold text-lg">{p.name}</div>
                {p.description && (
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</div>
                )}
              </button>
            ))}
            <button
              onClick={() => setIsDialogOpen(true)}
              className="rounded-lg border-dashed border-2 border-gray-300 hover:border-gray-400 p-4 flex items-center justify-center text-gray-600 hover:text-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
            >
              + Create new project
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;
