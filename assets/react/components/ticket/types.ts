export type Priority = 1 | 2 | 3 | 4 | 5;
import type { Member } from '@/react/types/member';

export interface Team {
  id: number;
  name: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority: Priority;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string | null;
  team?: Team;
  assignedTo?: Member | null;
}

export interface TicketFormData extends Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> {}

export interface BoardColumnProps {
  status: Ticket['status'];
  tickets: Ticket[];
  onAddTicket: (ticket: TicketFormData) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: string) => void;
}

export interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
}

export interface TicketFormProps {
  initialValues: TicketFormData;
  onSubmit: (data: TicketFormData) => void;
  onCancel: () => void;
}
