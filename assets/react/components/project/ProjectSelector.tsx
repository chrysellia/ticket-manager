import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectService } from '../../services/projectService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ProjectSelector() {
  const { projects, selectedProjectId, setSelectedProjectId, loading, refreshProjects } = useProject();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedProjectId != null ? String(selectedProjectId) : ''}
        onValueChange={(val) => setSelectedProjectId(val ? Number(val) : null)}
        disabled={loading}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder={loading ? 'Loading projects...' : 'Select project'} />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">New Project</Button>
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
  );
}

export default ProjectSelector;
