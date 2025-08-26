import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Member } from '@/react/types/member';
import { MemberService } from '@/react/services/memberService';
import { useProject } from '@/react/context/ProjectContext';

type Priority = 1 | 2 | 3 | 4 | 5;

type Ticket = {
  id?: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority: Priority;
  assignedTo?: Member | null;
};

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  ticket?: Ticket | null;
};

export function TicketModal({ isOpen, onClose, onSave, ticket }: TicketModalProps) {
  const { selectedProjectId } = useProject();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [suggestedMember, setSuggestedMember] = useState<Member | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [formData, setFormData] = useState<Omit<Ticket, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 3,
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo ?? null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 3,
        assignedTo: null,
      });
    }
  }, [ticket, isOpen]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!isOpen) return;
      try {
        setIsLoadingMembers(true);
        const list = await MemberService.getMembers(selectedProjectId || undefined);
        setMembers(list);
      } catch (e) {
        console.error('Failed to load members', e);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    loadMembers();
  }, [isOpen, selectedProjectId]);

  // Debounced suggestion fetch on title/description changes
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(async () => {
      const title = formData.title?.trim() || '';
      const description = formData.description?.trim() || '';
      if (!title && !description) {
        setSuggestedMember(null);
        return;
      }
      try {
        setIsSuggesting(true);
        const res = await fetch('/api/tickets/suggest-assignee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title, description, projectId: selectedProjectId ?? undefined })
        });
        if (!res.ok) throw new Error('Failed to get suggestion');
        const data = await res.json();
        if (data?.member?.id) {
          // Construct minimal Member object; email unknown here
          const m = members.find(mm => mm.id === data.member.id) || { id: data.member.id, name: data.member.name, email: '' } as Member;
          setSuggestedMember(m);
        } else {
          setSuggestedMember(null);
        }
      } catch (e) {
        // Silent fail for UX
        setSuggestedMember(null);
      } finally {
        setIsSuggesting(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [formData.title, formData.description, isOpen, selectedProjectId, members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      priority: formData.priority,
    });
  };

  const handleChange = (field: keyof typeof formData, value: Priority | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{ticket ? 'Edit Ticket' : 'Add New Ticket'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="col-span-3"
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) => {
                  // Convert string value to number and ensure it's a valid Priority
                  const priorityValue = parseInt(value, 10) as Priority;
                  handleChange('priority', priorityValue);
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Very low</SelectItem>
                  <SelectItem value="2">Low</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                  <SelectItem value="4">High</SelectItem>
                  <SelectItem value="5">Very high</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as Ticket['status'])}
              >
                <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                Assignee
              </Label>
              <Select
                value={formData.assignedTo ? String(formData.assignedTo.id) : 'unassigned'}
                onValueChange={(value) => {
                  if (value === 'unassigned') {
                    setFormData(prev => ({ ...prev, assignedTo: null }));
                  } else {
                    const selected = members.find(m => String(m.id) === value) || null;
                    setFormData(prev => ({ ...prev, assignedTo: selected }));
                  }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={isLoadingMembers ? 'Loading...' : 'Unassigned'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(suggestedMember && (!formData.assignedTo || formData.assignedTo.id !== suggestedMember.id)) && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div></div>
                <div className="col-span-3 flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Suggested:</span>
                  <button
                    type="button"
                    className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                    onClick={() => setFormData(prev => ({ ...prev, assignedTo: suggestedMember }))}
                    title="Apply suggested assignee"
                  >
                    {isSuggesting ? 'Suggesting...' : suggestedMember.name}
                  </button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {ticket ? 'Update' : 'Create'} Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
